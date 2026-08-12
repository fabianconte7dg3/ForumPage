'use server'

import { getPayload } from 'payload'

import { sesionActual } from '@/lib/auth'
import { idDeRelacion } from '@/access'
import config from '@/payload.config'

export type ResultadoReporteHoras = { ok: true } | { error: string; ok: false }

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_IMAGENES = 5
const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp']

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
  const descripcionDetallada = (formData.get('descripcion_detallada') as string)?.trim()
  const evidenciaArchivos = formData.getAll('evidencia').filter((v): v is File => v instanceof File && v.size > 0)

  // Validación
  if (!fecha || !horasStr || !actividad) {
    return { error: 'Completá la fecha, el número de horas y la descripción de la actividad.', ok: false }
  }

  const horas = Number(horasStr)
  if (Number.isNaN(horas) || horas <= 0 || horas > 200) {
    return { error: 'El número de horas debe ser un valor positivo (máximo 200).', ok: false }
  }

  if (actividad.length > 200) {
    return { error: 'El título de la actividad no puede superar los 200 caracteres.', ok: false }
  }
  if (descripcionDetallada && descripcionDetallada.length > 2000) {
    return { error: 'La descripción detallada no puede superar los 2000 caracteres.', ok: false }
  }

  // Validar fecha: no futura
  const fechaDate = new Date(fecha)
  if (Number.isNaN(fechaDate.getTime())) {
    return { error: 'La fecha ingresada no es válida.', ok: false }
  }
  if (fechaDate > new Date()) {
    return { error: 'La fecha no puede ser futura.', ok: false }
  }

  // Evidencia: hasta 1 PDF + hasta 5 imágenes.
  const pdfs = evidenciaArchivos.filter((f) => f.type === 'application/pdf')
  const imagenes = evidenciaArchivos.filter((f) => TIPOS_IMAGEN.includes(f.type))
  if (pdfs.length + imagenes.length !== evidenciaArchivos.length) {
    return { error: 'Solo se aceptan archivos PNG, JPG, WebP o PDF.', ok: false }
  }
  if (pdfs.length > 1) {
    return { error: 'Solo se puede adjuntar un PDF.', ok: false }
  }
  if (imagenes.length > MAX_IMAGENES) {
    return { error: `Máximo ${MAX_IMAGENES} imágenes.`, ok: false }
  }
  for (const archivo of evidenciaArchivos) {
    if (archivo.size > MAX_SIZE) {
      return { error: 'Cada archivo no puede superar los 10 MB.', ok: false }
    }
  }

  const payload = await getPayload({ config })

  // Subir evidencia a documentos-privados — nunca a `media`, que es de lectura
  // pública. `create` ahí es solo-staff a propósito: la única vía por la que
  // un becario sube algo es esta acción, que ya validó tamaño y tipo.
  const evidenciaIds: number[] = []
  for (const archivo of evidenciaArchivos) {
    const buffer = Buffer.from(await archivo.arrayBuffer())
    const doc = await payload.create({
      collection: 'documentos-privados',
      data: {
        alt: `Evidencia labor social — ${actividad.slice(0, 60)}`,
      },
      file: {
        data: buffer,
        mimetype: archivo.type,
        name: archivo.name,
        size: archivo.size,
      },
      user: usuario,
      overrideAccess: true,
    })
    evidenciaIds.push(doc.id)
  }

  // Crear el registro de horas — con la sesión real del usuario, no
  // overrideAccess. El hook forzarPropioBecario asigna `becario` al id
  // correcto. `estado` va explícito porque Payload lo tipa como requerido
  // aunque tenga defaultValue; ponerlo evita el `as any` que antes tapaba
  // cualquier error de tipos en esta llamada.
  await payload.create({
    collection: 'horas-labor-social',
    data: {
      becario: becarioId,
      descripcion: descripcionDetallada ? `${actividad}\n\n${descripcionDetallada}` : actividad,
      estado: 'pendiente',
      evidencia: evidenciaIds,
      fecha: fechaDate.toISOString(),
      horas,
    },
    user: usuario,
  })

  return { ok: true }
}
