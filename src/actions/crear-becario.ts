'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type CrearBecarioInput = {
  nombre: string
  email: string
  comunidadId?: number
  nivel_educativo: 'primaria' | 'premedia' | 'media' | 'universidad'
  tipo_apoyo?: ('hospedaje' | 'transporte' | 'alimento')[]
  universidad?: string
  carrera?: string
  anio?: number
  anio_inicio?: number
  tipo_estudio: 'nacional' | 'internacional'
  pais_estudio?: string
  ciudad_estudio?: string
  lat?: number
  lng?: number
  estado: 'activo' | 'suspendido' | 'graduado' | 'retornado' | 'retirado'
  consentimiento_firmado: boolean
  mostrar_en_mapa: boolean
  cita?: string
  locale: Locale
}

export async function crearBecario(input: CrearBecarioInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar becarios.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre completo es obligatorio.' }
  }

  if (!input.email || !EMAIL_RE.test(input.email.trim())) {
    return { error: 'El correo del becario no es válido.' }
  }

  if (input.mostrar_en_mapa && !input.consentimiento_firmado) {
    return { error: 'No se puede mostrar en el mapa sin el consentimiento firmado.' }
  }

  const payload = await getPayload({ config })

  try {
    const dataToCreate: Record<string, unknown> = {
      nombre: input.nombre.trim(),
      comunidad: input.comunidadId || undefined,
      nivel_educativo: input.nivel_educativo,
      tipo_apoyo: input.tipo_apoyo?.length ? input.tipo_apoyo : undefined,
      universidad: input.universidad?.trim() || undefined,
      carrera: input.carrera?.trim() || undefined,
      anio: input.anio || undefined,
      anio_inicio: input.anio_inicio || undefined,
      tipo_estudio: input.tipo_estudio,
      estado: input.estado,
      consentimiento_firmado: input.consentimiento_firmado,
      consentimiento_fecha: input.consentimiento_firmado ? new Date().toISOString() : undefined,
      mostrar_en_mapa: input.mostrar_en_mapa,
      cita: input.cita?.trim() || undefined,
    }

    if (input.tipo_estudio === 'internacional') {
      dataToCreate.pais_estudio = input.pais_estudio?.trim() || undefined
      dataToCreate.ciudad_estudio = input.ciudad_estudio?.trim() || undefined
      if (input.lat !== undefined && input.lng !== undefined) {
        dataToCreate.coordenadas_estudio = {
          lat: input.lat,
          lng: input.lng,
        }
      }
    }

    const nuevo = await payload.create({
      collection: 'becarios',
      locale: input.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToCreate as any,
      overrideAccess: false,
      user: usuario,
    })

    // Une en un solo paso lo que antes exigía ir a /admin aparte: crear el
    // login del becario y generar su enlace de invitación. La contraseña de
    // relleno nunca se usa — el hook `generarInvitacionAlCrear` de
    // `Users.ts` la pisa enseguida y arma el enlace de un solo uso; acá solo
    // hace falta un valor que pase el mínimo de 8 caracteres para crear la
    // cuenta.
    let enlaceInvitacion: string | null = null
    try {
      await payload.create({
        collection: 'users',
        data: {
          email: input.email.trim(),
          password: randomBytes(32).toString('hex'),
          rol: 'becario',
          becario: nuevo.id,
        },
        overrideAccess: false,
        user: usuario,
      })
      // El create de arriba no trae el enlace todavía — el hook lo escribe
      // con un update posterior al propio create, hace falta releer.
      // overrideAccess acá es necesario y seguro: el access de lectura de
      // `users` a nivel de colección limita a un staff a ver solo su propio
      // documento (`id: { equals: req.user.id }`), así que con
      // overrideAccess: false esta consulta volvería vacía para cualquier
      // staff que no sea admin. El propio `sesionActual()` de arriba ya
      // valida que quien llama es staff/admin, y la acción solo devuelve al
      // cliente el string del enlace — nunca el resto del documento.
      const cuentaBecario = await payload.find({
        collection: 'users',
        where: { becario: { equals: nuevo.id } },
        limit: 1,
        overrideAccess: true,
      })
      enlaceInvitacion = (cuentaBecario.docs[0]?.enlace_invitacion as string | undefined) ?? null
    } catch (errorCuenta) {
      console.error('Becario creado, pero falló crear su cuenta/invitación:', errorCuenta)
      revalidatePath(`/${input.locale}/staff`)
      revalidatePath(`/${input.locale}/impacto`)
      return {
        success: true,
        id: nuevo.id,
        enlaceInvitacion: null,
        avisoCuenta: 'El becario se registró, pero no se pudo crear su cuenta (¿ese correo ya está en uso?). Podés reintentar desde /admin.',
      }
    }

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/impacto`)
    return { success: true, id: nuevo.id, enlaceInvitacion }
  } catch (error) {
    console.error('Error al crear becario:', error)
    return { error: 'Ocurrió un error al registrar el becario. Revisa los datos ingresados.' }
  }
}
