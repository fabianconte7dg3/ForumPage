import { randomBytes } from 'crypto'
import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterLoginHook,
  type CollectionBeforeLoginHook,
  type CollectionBeforeValidateHook,
  type CollectionConfig,
  getFieldsToSign,
  jwtSign,
  type PayloadHandler,
  type PayloadRequest,
} from 'payload'
import QRCode from 'qrcode'

import { esAdmin, esAdminFieldAccess, esStaffOSuperior, esStaffOSuperiorFieldAccess } from '@/access'
import { registrarAuditoria } from '@/lib/auditoria'
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

// Payload por defecto solo exige 3 caracteres para el campo password del
// esquema auth — mucho más débil que el mínimo de 8 que ya exige
// `cambiar-password.ts` para el cambio de contraseña autoservicio. Sin este
// hook, la activación de cuenta por invitación (`/api/users/reset-password`,
// el flujo real que usan todos los becarios) quedaba con el mínimo débil de
// Payload en vez del mismo criterio que el resto de la app. No aplica a la
// contraseña de relleno aleatoria de 32 bytes que genera el sistema al crear
// un becario — esa siempre pasa de sobra los 8 caracteres.
const exigirPasswordFuerte: CollectionBeforeValidateHook = ({ data }) => {
  if (typeof data?.password === 'string' && data.password.length > 0 && data.password.length < 8) {
    throw new APIError('La contraseña debe tener al menos 8 caracteres.', 400)
  }
  return data
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

// Alta por invitación (01-documento-de-proyecto.md §Operación): el staff crea
// la cuenta desde el formulario estándar del panel (con cualquier contraseña
// de relleno, Payload la exige), y esta función, al vuelo, 1) invalida esa
// contraseña de relleno con una aleatoria que nadie conoce, y 2) genera un
// enlace de activación de un solo uso (mismo mecanismo de "olvidé mi
// contraseña" que ya trae Payload) y lo deja en `enlace_invitacion` para que
// el staff lo copie y lo mande — así nadie entra a la cuenta antes que la
// persona invitada.
const generarInvitacionAlCrear: CollectionAfterChangeHook<User> = async ({ doc, operation, req }) => {
  // Solo becarios — 01-documento-de-proyecto.md lo pide específicamente para
  // ellos ("ser becario es una condición otorgada tras evaluación, no
  // solicitada"). Staff/directiva/admin se siguen dando de alta con una
  // contraseña real puesta directamente por quien los crea (igual que el
  // primer usuario admin, que tampoco pasa por invitación).
  if (operation !== 'create' || doc.rol !== 'becario') return

  await req.payload.update({
    collection: 'users',
    id: doc.id,
    data: { password: randomBytes(32).toString('hex') },
    overrideAccess: true,
    req,
  })

  const token = await req.payload.forgotPassword({
    collection: 'users',
    data: { email: doc.email },
    disableEmail: true,
    overrideAccess: true,
    req,
  })

  const origen = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
  await req.payload.update({
    collection: 'users',
    id: doc.id,
    data: { enlace_invitacion: `${origen}/es/cuenta/activar?token=${token}` },
    overrideAccess: true,
    req,
  })
}

// "Auditoría activa sobre... roles" (3.5 del plan de ejecución). Nunca en la
// creación (el rol inicial no es un "cambio"), solo en transiciones reales.
const registrarCambioRol: CollectionAfterChangeHook<User> = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !previousDoc || doc.rol === previousDoc.rol) return

  await registrarAuditoria(req, {
    accion: 'cambio_de_rol',
    coleccion: 'users',
    documentoId: doc.id,
    valorAnterior: { rol: previousDoc.rol },
    valorNuevo: { rol: doc.rol },
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

// Lee los claims de un JWT ya firmado por Payload sin volver a verificarlo —
// solo para leer `exp`/`sid`, que jwtSign ya dejó adentro.
function claimsDeJwt(token: string): { exp?: number; sid?: string } {
  const payload = token.split('.')[1]
  if (!payload) return {}
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { exp?: number; sid?: string }
  } catch {
    return {}
  }
}

// Duración de sesión diferenciada por rol (01-documento-de-proyecto.md
// §Operación: "corta para staff y directiva, larga para becarios"). Payload
// solo soporta un `tokenExpiration` fijo por colección — acá se vuelve a
// firmar el JWT que ya devolvió login()/resetPassword() con la duración
// correcta según el rol, reusando los mismos `getFieldsToSign`/`jwtSign` que
// usa Payload internamente (exportados desde 'payload').
const DURACION_CORTA_SEGUNDOS = 60 * 60 * 2 // 2h — staff/directiva/admin, mismo valor que el default de Payload
const DURACION_LARGA_SEGUNDOS = 60 * 60 * 24 * 30 // 30 días — becarios, portal de uso esporádico

async function reemitirTokenConDuracionPorRol(
  req: PayloadRequest,
  usuario: User,
  tokenOriginal: string,
): Promise<{ exp: number; token: string }> {
  const segundos = usuario.rol === 'becario' ? DURACION_LARGA_SEGUNDOS : DURACION_CORTA_SEGUNDOS
  const { sid } = claimsDeJwt(tokenOriginal)
  const collectionConfig = req.payload.collections.users.config

  const fieldsToSign = getFieldsToSign({ collectionConfig, email: usuario.email, sid, user: usuario })
  const { exp, token } = await jwtSign({ fieldsToSign, secret: req.payload.secret, tokenExpiration: segundos })

  // La sesión ya quedó registrada en `sessions[]` por login()/resetPassword()
  // con el vencimiento por defecto (2h) — hay que corregirla también, o un
  // login posterior desde otro dispositivo podaría esta sesión como
  // "vencida" antes de tiempo y cerraría esta pestaña de golpe.
  if (sid && usuario.sessions?.some((s) => s.id === sid)) {
    await req.payload.update({
      collection: 'users',
      id: usuario.id,
      data: {
        sessions: usuario.sessions.map((s) => (s.id === sid ? { ...s, expiresAt: new Date(exp * 1000).toISOString() } : s)),
      },
      overrideAccess: true,
      req,
    })
  }

  return { exp, token }
}

const comoTexto = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

// Reemplaza el /login por defecto de Payload (un endpoint propio con el mismo
// path+method gana — Payload hace `.find()` y los endpoints del usuario van
// primero en el arreglo). Login en dos pasos cuando el usuario tiene 2FA
// habilitado: 1) contraseña → si tiene 2FA, no se emite cookie todavía, se
// devuelve un desafioId; 2) desafioId + código TOTP → recién ahí se emite la
// cookie real (el token de la contraseña ya estaba listo desde el paso 1,
// solo se retiene hasta confirmar el segundo factor).
const iniciarSesion: PayloadHandler = async (req) => {
  const contentType = req.headers.get('content-type') || ''
  let body: Record<string, unknown> | undefined
  try {
    if (contentType.includes('multipart/form-data')) {
      // El panel admin de Payload envía multipart con un campo "_payload"
      // que contiene el JSON como string.
      const formData = await req.formData?.()
      const payloadField = formData?.get('_payload')
      if (typeof payloadField === 'string') {
        body = JSON.parse(payloadField)
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const rawText = await req.text?.() ?? ''
      body = Object.fromEntries(new URLSearchParams(rawText))
    } else {
      // application/json (llamadas directas al API, curl, etc.)
      body = await req.json?.()
    }
  } catch {
    // Ignorar error de parsing
  }

  // El cuerpo viene de la red: cada campo se acepta solo si llegó como string.
  // Sin esto, un `{"email": {"$ne": null}}` entraba tal cual a payload.login.
  const desafioId = comoTexto(body?.desafioId)
  const codigo = comoTexto(body?.codigo)
  const email = comoTexto(body?.email)
  const password = comoTexto(body?.password)

  if (desafioId) {
    const resultado = codigo ? verificarYConsumirDesafio(desafioId, codigo) : undefined
    if (!resultado) {
      return Response.json({ message: 'Código inválido o expirado' }, { status: 401 })
    }
    return respuestaConSesion(req, resultado.token, resultado.exp)
  }

  if (!email || !password) {
    return Response.json({ message: 'Correo y contraseña requeridos' }, { status: 400 })
  }

  let resultado: Awaited<ReturnType<typeof req.payload.login>>
  try {
    resultado = await req.payload.login({ collection: 'users', data: { email, password }, req })
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 401 })
  }

  const usuario = resultado.user as unknown as User
  if (!resultado.token || resultado.exp === undefined) {
    return Response.json({ message: 'No se pudo iniciar sesión' }, { status: 500 })
  }

  const { exp, token } = await reemitirTokenConDuracionPorRol(req, usuario, resultado.token)

  if (usuario.dosFA_habilitado && usuario.dosFA_secreto) {
    const desafioId = crearDesafio(token, exp, usuario.dosFA_secreto)
    return Response.json({ requiere2FA: true, desafioId })
  }

  return respuestaConSesion(req, token, exp)
}

// Reemplaza el /reset-password por defecto de Payload — el de por defecto
// emite sesión directo apenas el token+contraseña son válidos, sin mirar si
// la cuenta tiene 2FA habilitado (gap real detectado en el Paso I: serviría
// para saltear el segundo factor con solo el enlace de "olvidé mi
// contraseña"). Mismo patrón de desafío en dos pasos que /login.
const restablecerContrasena: PayloadHandler = async (req) => {
  const body = (await req.json?.()) as
    | { codigo?: string; desafioId?: string; password?: string; token?: string }
    | undefined

  if (body?.desafioId) {
    const resultado = body.codigo ? verificarYConsumirDesafio(body.desafioId, body.codigo) : undefined
    if (!resultado) {
      return Response.json({ message: 'Código inválido o expirado' }, { status: 401 })
    }
    return respuestaConSesion(req, resultado.token, resultado.exp)
  }

  if (!body?.token || !body?.password) {
    return Response.json({ message: 'Token y contraseña requeridos' }, { status: 400 })
  }

  let resultado: Awaited<ReturnType<typeof req.payload.resetPassword>>
  try {
    resultado = await req.payload.resetPassword({
      collection: 'users',
      data: { token: body.token, password: body.password },
      overrideAccess: true,
      req,
    })
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 403 })
  }

  const usuario = resultado.user as unknown as User
  if (!resultado.token) {
    return Response.json({ message: 'No se pudo restablecer la contraseña' }, { status: 500 })
  }

  const { exp, token } = await reemitirTokenConDuracionPorRol(req, usuario, resultado.token)

  if (usuario.dosFA_habilitado && usuario.dosFA_secreto) {
    const desafioId = crearDesafio(token, exp, usuario.dosFA_secreto)
    return Response.json({ requiere2FA: true, desafioId })
  }

  return respuestaConSesion(req, token, exp)
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
    beforeValidate: [exigirPasswordFuerte],
    beforeLogin: [bloquearInactivos],
    afterLogin: [registrarUltimoAcceso],
    afterChange: [generarInvitacionAlCrear, registrarCambioRol],
  },
  endpoints: [
    { handler: iniciarSesion, method: 'post', path: '/login' },
    { handler: restablecerContrasena, method: 'post', path: '/reset-password' },
    { handler: generarDosFA, method: 'post', path: '/2fa/generar' },
    { handler: confirmarDosFA, method: 'post', path: '/2fa/confirmar' },
    { handler: desactivarDosFA, method: 'post', path: '/2fa/desactivar' },
  ],
  access: {
    // Sin esto, Payload usa su default: cualquier usuario autenticado de
    // esta colección entra a /admin — incluido un becario. Bug real
    // encontrado probando en el VPS: un becario recién invitado, tras
    // activar su cuenta, quedó redirigido a /admin (en vez de /portal) y
    // podía ver ahí las Publicaciones. El becario nunca debe tener acceso al
    // panel nativo de Payload, solo a /portal.
    admin: ({ req }) => ['staff', 'directiva', 'admin'].includes((req.user as User | null)?.rol ?? ''),
    // Staff invita becarios/directiva; escalar a admin queda bloqueado en el
    // validate del campo `rol`, no acá — bloquear todo el `create` para
    // no-admin dejaría al staff sin poder invitar a nadie.
    create: esStaffOSuperior,
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
      // access.update ya bloquea que alguien cambie SU rol a admin, pero eso
      // no cubre la creación (field access de `create` es independiente y por
      // defecto abierto) — ahora que staff también puede invitar cuentas
      // (`create: esStaffOSuperior` arriba), staff podría intentar invitar
      // directo con rol admin si no se valida acá también.
      // Solo bloquea cuando hay un actor autenticado de verdad tratando de
      // escalar — un script interno u overrideAccess (seed, primer usuario)
      // no trae req.user y no debe quedar atrapado por esta regla.
      validate: (value: string | null | undefined, { req }: { req: PayloadRequest }) => {
        if (value === 'admin' && req.user && (req.user as User).rol !== 'admin') {
          return 'Solo un admin puede asignar el rol admin'
        }
        return true
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
      name: 'enlace_invitacion',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Copiá y enviá este enlace a la persona invitada — vence en 1 hora y es de un solo uso. Se genera solo al crear la cuenta.',
      },
      access: { create: () => false, read: esStaffOSuperiorFieldAccess, update: () => false },
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
