'use server'

import { getPayload } from 'payload'

import { sesionActual } from '@/lib/auth'
import { idDeRelacion } from '@/access'
import config from '@/payload.config'

export type ResultadoReporteAcademico = { ok: true } | { error: string; ok: false }

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']

async function subirDocumento(payload: Awaited<ReturnType<typeof getPayload>>, archivo: File, alt: string, usuario: Awaited<ReturnType<typeof sesionActual>>) {
  const buffer = Buffer.from(await archivo.arrayBuffer())
  // Subir a documentos-privados — nunca a `media`, que es de lectura pública.
  // `create` ahí es solo-staff a propósito: esta acción ya validó tamaño y
  // tipo, es la única vía por la que un becario sube algo.
  const doc = await payload.create({
    collection: 'documentos-privados',
    data: { alt },
    file: {
      data: buffer,
      mimetype: archivo.type,
      name: archivo.name,
      size: archivo.size,
    },
    user: usuario,
    overrideAccess: true,
  })
  return doc.id
}

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
  const matriculaArchivo = formData.get('documento_matricula') as File | null
  const creditosArchivo = formData.get('documento_creditos') as File | null

  if (!periodo || !universidad) {
    return { error: 'Completá el período y la universidad.', ok: false }
  }
  const tieneMatricula = !!matriculaArchivo && matriculaArchivo.size > 0
  const tieneCreditos = !!creditosArchivo && creditosArchivo.size > 0
  if (!tieneMatricula && !tieneCreditos) {
    return { error: 'Subí al menos la constancia de matrícula o el reporte de créditos.', ok: false }
  }

  for (const archivo of [matriculaArchivo, creditosArchivo]) {
    if (!archivo || archivo.size === 0) continue
    if (archivo.size > MAX_SIZE) {
      return { error: 'Cada archivo no puede superar los 10 MB.', ok: false }
    }
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return { error: 'Solo se aceptan archivos PNG, JPG, WebP o PDF.', ok: false }
    }
  }

  const payload = await getPayload({ config })

  const documentoMatriculaId = tieneMatricula ? await subirDocumento(payload, matriculaArchivo!, `Constancia de matrícula — ${periodo}`, usuario) : undefined
  const documentoCreditosId = tieneCreditos ? await subirDocumento(payload, creditosArchivo!, `Reporte de créditos — ${periodo}`, usuario) : undefined

  // Con la sesión real del usuario, no overrideAccess — el hook
  // forzarPropioBecario asigna `becario` al id correcto. estado_verificacion
  // va explícito porque el campo lo tipa como requerido, aunque el
  // access.create solo-staff de ese campo lo va a ignorar igual y va a caer
  // en su defaultValue 'pendiente'.
  await payload.create({
    collection: 'registros-academicos',
    data: {
      becario: becarioId,
      documento_creditos: documentoCreditosId,
      documento_matricula: documentoMatriculaId,
      estado_verificacion: 'pendiente',
      periodo,
      universidad,
    },
    user: usuario,
  })

  return { ok: true }
}
