'use server'

import { getPayload } from 'payload'

import { sesionActual } from '@/lib/auth'
import { idDeRelacion } from '@/access'
import config from '@/payload.config'

export type ResultadoReporteAcademico = { ok: true } | { error: string; ok: false }

// Mismo patrón que reportar-horas.ts: el becario ya tiene permiso de `create`
// en registros-academicos (creacionRegistros en RegistrosAcademicos.ts lo
// permite), así que corre con la sesión real — el hook forzarPropioBecario
// autocompleta `becario`, y estado_verificacion queda en su defaultValue
// 'pendiente' porque ese campo tiene access.create solo-staff (el valor
// enviado por un becario se ignora, no hace falta forzarlo acá).
export async function reportarRegistroAcademico(formData: FormData): Promise<ResultadoReporteAcademico> {
  const usuario = await sesionActual()
  if (!usuario || usuario.rol !== 'becario') {
    return { error: 'Debés iniciar sesión como becario para subir un registro académico.', ok: false }
  }

  const becarioId = idDeRelacion(usuario.becario)
  if (!becarioId) {
    return { error: 'Tu cuenta no tiene un perfil de becario vinculado.', ok: false }
  }

  const periodo = (formData.get('periodo') as string)?.trim()
  const universidad = (formData.get('universidad') as string)?.trim()
  const documentoArchivo = formData.get('documento') as File | null

  if (!periodo || !universidad) {
    return { error: 'Completá el período y la universidad.', ok: false }
  }
  if (!documentoArchivo || documentoArchivo.size === 0) {
    return { error: 'Subí la constancia de matrícula o el reporte de créditos.', ok: false }
  }

  const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
  if (documentoArchivo.size > MAX_SIZE) {
    return { error: 'El archivo no puede superar los 10 MB.', ok: false }
  }
  const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
  if (!tiposPermitidos.includes(documentoArchivo.type)) {
    return { error: 'Solo se aceptan archivos PNG, JPG, WebP o PDF.', ok: false }
  }

  const payload = await getPayload({ config })

  // Subir a documentos-privados — nunca a `media`, que es de lectura pública.
  // `create` ahí es solo-staff a propósito: esta acción ya validó tamaño y
  // tipo, es la única vía por la que un becario sube algo.
  const buffer = Buffer.from(await documentoArchivo.arrayBuffer())
  const documentoDoc = await payload.create({
    collection: 'documentos-privados',
    data: { alt: `Constancia académica — ${periodo}` },
    file: {
      data: buffer,
      mimetype: documentoArchivo.type,
      name: documentoArchivo.name,
      size: documentoArchivo.size,
    },
    user: usuario,
    overrideAccess: true,
  })

  // Con la sesión real del usuario, no overrideAccess — el hook
  // forzarPropioBecario asigna `becario` al id correcto. estado_verificacion
  // va explícito porque el campo lo tipa como requerido, aunque el
  // access.create solo-staff de ese campo lo va a ignorar igual y va a caer
  // en su defaultValue 'pendiente'.
  await payload.create({
    collection: 'registros-academicos',
    data: {
      becario: becarioId,
      documento: documentoDoc.id,
      estado_verificacion: 'pendiente',
      periodo,
      universidad,
    },
    user: usuario,
  })

  return { ok: true }
}
