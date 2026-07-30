import type { CollectionAfterLoginHook, CollectionBeforeLoginHook, CollectionConfig, PayloadHandler, PayloadRequest } from 'payload'
import QRCode from 'qrcode'

import { esAdmin, esAdminFieldAccess } from '@/access'
import { crearDesafio, verificarYConsumirDesafio } from '@/lib/dos-fa-desafios'
import { generarSecreto, otpauthUri, verificarCodigo } from '@/lib/totp'
import type { User } from '@/payload-types'

// Cuenta desactivada (baja de personal, no borrado) no puede iniciar sesión
// aunque la contraseña siga siendo válida (05-ciberseguridad.md "procedimiento
// de baja": desactivar, no eliminar).
const bloquearInactivos: CollectionBeforeLoginHook = ({ user }) => {
  if (!user.activo) {
    throw new Error('Esta cuenta está desactivada')
  }
}

const registrarUltimoAcceso: CollectionAfterLoginHook = async ({ user, req }) => {
  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { ultimo_acceso: new Date().toISOString() },
    overrideAccess: true,
    req,
  })
}

// Arma la misma cookie de sesión que pondría el /login por defecto de Payload
// (mismo nombre `${cookiePrefix}-token`, que es lo que extractJWT busca), para
// que el resto del sistema (panel admin, /api/users/me) no note la diferencia.
function respuestaConSesion(req: PayloadRequest, token: string, exp: number): Response {
  const prefijo = req.payload.config.cookiePrefix ?? 'payload'
  const maxAge = exp - Math.floor(Date.now() / 1000)
  const segura = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const cookie = `${prefijo}-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${segura}`
  return Response.json({ token, exp }, { headers: { 'Set-Cookie': cookie } })
}

// Reemplaza el /login por defecto de Payload (un endpoint propio con el mismo
// path+method gana — Payload hace `.find()` y los endpoints del usuario van
// primero en el arreglo). Login en dos pasos cuando el usuario tiene 2FA
// habilitado: 1) contraseña → si tiene 2FA, no se emite cookie todavía, se
// devuelve un desafioId; 2) desafioId + código TOTP → recién ahí se emite la
// cookie real (el token de la contraseña ya estaba listo desde el paso 1,
// solo se retiene hasta confirmar el segundo factor).
const iniciarSesion: PayloadHandler = async (req) => {
  const body = (await req.json?.()) as
    | { codigo?: string; desafioId?: string; email?: string; password?: string }
    | undefined

  if (body?.desafioId) {
    const resultado = body.codigo ? verificarYConsumirDesafio(body.desafioId, body.codigo) : undefined
    if (!resultado) {
      return Response.json({ message: 'Código inválido o expirado' }, { status: 401 })
    }
    return respuestaConSesion(req, resultado.token, resultado.exp)
  }

  if (!body?.email || !body?.password) {
    return Response.json({ message: 'Correo y contraseña requeridos' }, { status: 400 })
  }

  let resultado: Awaited<ReturnType<typeof req.payload.login>>
  try {
    resultado = await req.payload.login({ collection: 'users', data: { email: body.email, password: body.password }, req })
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 401 })
  }

  const usuario = resultado.user as unknown as User
  if (!resultado.token || resultado.exp === undefined) {
    return Response.json({ message: 'No se pudo iniciar sesión' }, { status: 500 })
  }

  if (usuario.dosFA_habilitado && usuario.dosFA_secreto) {
    const desafioId = crearDesafio(resultado.token, resultado.exp, usuario.dosFA_secreto)
    return Response.json({ requiere2FA: true, desafioId })
  }

  return respuestaConSesion(req, resultado.token, resultado.exp)
}

// Solo para uno mismo — genera un secreto nuevo (queda pendiente hasta
// /2fa/confirmar) y el QR para escanearlo con la app autenticadora.
const generarDosFA: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ message: 'No autenticado' }, { status: 401 })
  const secreto = generarSecreto()
  await req.payload.update({
    collection: 'users',
    id: req.user.id,
    data: { dosFA_secreto: secreto, dosFA_habilitado: false },
    overrideAccess: true,
    req,
  })
  const uri = otpauthUri(secreto, req.user.email)
  const qr = await QRCode.toDataURL(uri)
  return Response.json({ qr, secreto, uri })
}

// Confirma el secreto pendiente con un código real de la app — recién acá
// dosFA_habilitado pasa a true.
const confirmarDosFA: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ message: 'No autenticado' }, { status: 401 })
  const body = (await req.json?.()) as { codigo?: string } | undefined
  const usuario = (await req.payload.findByID({ collection: 'users', id: req.user.id, overrideAccess: true, req })) as User
  if (!usuario.dosFA_secreto || !body?.codigo || !verificarCodigo(usuario.dosFA_secreto, body.codigo)) {
    return Response.json({ message: 'Código inválido' }, { status: 400 })
  }
  await req.payload.update({ collection: 'users', id: req.user.id, data: { dosFA_habilitado: true }, overrideAccess: true, req })
  return Response.json({ ok: true })
}

// Requiere reingresar la contraseña — desactivar 2FA es una acción sensible,
// no debe alcanzar con una sesión ya abierta (ej. secuestrada por XSS).
const desactivarDosFA: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ message: 'No autenticado' }, { status: 401 })
  const body = (await req.json?.()) as { password?: string } | undefined
  if (!body?.password) return Response.json({ message: 'Contraseña requerida' }, { status: 400 })
  try {
    await req.payload.login({ collection: 'users', data: { email: req.user.email, password: body.password }, req })
  } catch {
    return Response.json({ message: 'Contraseña incorrecta' }, { status: 401 })
  }
  await req.payload.update({
    collection: 'users',
    id: req.user.id,
    data: { dosFA_habilitado: false, dosFA_secreto: null },
    overrideAccess: true,
    req,
  })
  return Response.json({ ok: true })
}

// IAM — ver docs/spec.md#control-de-acceso-iam y 03-runbook-tecnico.md §7.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'rol', 'activo'],
  },
  auth: true,
  hooks: {
    beforeLogin: [bloquearInactivos],
    afterLogin: [registrarUltimoAcceso],
  },
  endpoints: [
    { handler: iniciarSesion, method: 'post', path: '/login' },
    { handler: generarDosFA, method: 'post', path: '/2fa/generar' },
    { handler: confirmarDosFA, method: 'post', path: '/2fa/confirmar' },
    { handler: desactivarDosFA, method: 'post', path: '/2fa/desactivar' },
  ],
  access: {
    create: esAdmin,
    read: ({ req }) => {
      if ((req.user as { rol?: string } | null)?.rol === 'admin') return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    update: ({ req }) => {
      if ((req.user as { rol?: string } | null)?.rol === 'admin') return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    delete: esAdmin,
  },
  fields: [
    {
      name: 'rol',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Staff', value: 'staff' },
        { label: 'Directiva', value: 'directiva' },
        { label: 'Becario', value: 'becario' },
      ],
      // Un usuario no-admin no puede escalar su propio rol.
      access: {
        update: esAdminFieldAccess,
      },
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
      // Cuentas se desactivan, nunca se borran — solo admin puede reactivar/desactivar.
      access: {
        update: esAdminFieldAccess,
      },
    },
    {
      name: 'ultimo_acceso',
      type: 'date',
      admin: { readOnly: true, description: 'Se completa solo en cada login exitoso' },
      access: { create: esAdminFieldAccess, update: esAdminFieldAccess },
    },
    {
      name: 'dosFA_habilitado',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true, description: '2FA activo — se configura desde /api/users/2fa/generar + /2fa/confirmar; un admin puede forzar la desactivación' },
      access: { update: esAdminFieldAccess },
    },
    {
      name: 'dosFA_secreto',
      type: 'text',
      admin: { hidden: true },
      // Nunca expuesto por la API, ni siquiera al dueño o a un admin —
      // equivalente a una contraseña. Solo se toca con overrideAccess desde
      // los endpoints /2fa/*.
      access: { create: () => false, read: () => false, update: () => false },
    },
    {
      name: 'becario',
      type: 'relationship',
      relationTo: 'becarios',
      admin: {
        condition: (data) => data?.rol === 'becario',
        description: 'El registro de becario vinculado a esta cuenta',
      },
      // Un becario no puede vincularse a sí mismo a otro expediente.
      access: {
        update: esAdminFieldAccess,
      },
    },
  ],
  versions: false,
}
