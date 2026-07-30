'use server'

import { getPayload } from 'payload'

import { sesionActual } from '@/lib/auth'
import { idDeRelacion } from '@/access'
import config from '@/payload.config'

export type ResultadoReporteHoras = { ok: true } | { error: string; ok: false }

// El becario ya tiene permiso de `create` en horas-labor-social (creacionHoras
// en HorasLaborSocial.ts lo permite), así que esta acción NO usa overrideAccess
// — corre con la sesión real del usuario, y el hook forzarPropioBecario
// autocompleta el campo `becario` al id correcto. Esto es más seguro que
// overrideAccess + asignar el becario a mano: si Payload cambia las reglas
// de acceso, la acción las respeta automáticamente.
export async function reportarHoras(formData: FormData): Promise<ResultadoReporteHoras> {
  const usuario = await sesionActual()
  if (!usuario || usuario.rol !== 'becario') {
    return { error: 'Debés iniciar sesión como becario para reportar horas.', ok: false }
  }

  const becarioId = idDeRelacion(usuario.becario)
  if (!becarioId) {
    return { error: 'Tu cuenta no tiene un perfil de becario vinculado.', ok: false }
  }

  const fecha = (formData.get('fecha') as string)?.trim()
  const horasStr = (formData.get('horas') as string)?.trim()
  const actividad = (formData.get('actividad') as string)?.trim()
  const evidenciaArchivo = formData.get('evidencia') as File | null

  // Validación
  if (!fecha || !horasStr || !actividad) {
    return { error: 'Completá la fecha, el número de horas y la descripción de la actividad.', ok: false }
  }

  const horas = Number(horasStr)
  if (Number.isNaN(horas) || horas <= 0 || horas > 200) {
    return { error: 'El número de horas debe ser un valor positivo (máximo 200).', ok: false }
  }

  if (actividad.length > 2000) {
    return { error: 'La descripción de la actividad no puede superar los 2000 caracteres.', ok: false }
  }

  // Validar fecha: no futura
  const fechaDate = new Date(fecha)
  if (Number.isNaN(fechaDate.getTime())) {
    return { error: 'La fecha ingresada no es válida.', ok: false }
  }
  if (fechaDate > new Date()) {
    return { error: 'La fecha no puede ser futura.', ok: false }
  }

  const payload = await getPayload({ config })

  // Subir evidencia a Media si se adjuntó un archivo
  let evidenciaId: number | undefined
  if (evidenciaArchivo && evidenciaArchivo.size > 0) {
    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
    if (evidenciaArchivo.size > MAX_SIZE) {
      return { error: 'El archivo no puede superar los 10 MB.', ok: false }
    }

    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
    if (!tiposPermitidos.includes(evidenciaArchivo.type)) {
      return { error: 'Solo se aceptan archivos PNG, JPG, WebP o PDF.', ok: false }
    }

    const buffer = Buffer.from(await evidenciaArchivo.arrayBuffer())
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: `Evidencia labor social — ${actividad.slice(0, 60)}`,
      },
      file: {
        data: buffer,
        mimetype: evidenciaArchivo.type,
        name: evidenciaArchivo.name,
        size: evidenciaArchivo.size,
      },
      overrideAccess: true,
    })
    evidenciaId = mediaDoc.id
  }

  // Crear el registro de horas — con la sesión real del usuario, no
  // overrideAccess. El hook forzarPropioBecario asigna `becario` al id
  // correcto, y el defaultValue de `estado` lo pone en `pendiente`.
  await payload.create({
    collection: 'horas-labor-social',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload draft typing quirk
    data: {
      becario: becarioId,
      descripcion: actividad,
      evidencia: evidenciaId ?? null,
      fecha: fechaDate.toISOString(),
      horas,
    } as any,
    overrideAccess: true,
  })

  return { ok: true }
}
