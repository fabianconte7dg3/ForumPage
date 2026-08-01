import { getPayload } from 'payload'
import config from '../src/payload.config'
import fs from 'fs'
import path from 'path'

// Script para migrar archivos confidenciales de la colección pública 'media'
// a la nueva colección 'documentos-privados'.
// Debe correrse ANTES de cambiar los schemas (relationTo) para no romper
// las referencias actuales.

async function run() {
  const payload = await getPayload({ config })
  
  // 1. Obtener todos los documentos afectados
  const becarios = await payload.find({ collection: 'becarios', limit: 1000, depth: 0 })
  const registros = await payload.find({ collection: 'registros-academicos', limit: 1000, depth: 0 })
  const horas = await payload.find({ collection: 'horas-labor-social', limit: 1000, depth: 0 })
  
  const toMigrate: { col: string, id: number, field: string, mediaId: number }[] = []
  
  for (const b of becarios.docs) {
    if (b.documentacion_socioeconomica) {
      toMigrate.push({ col: 'becarios', id: b.id, field: 'documentacion_socioeconomica', mediaId: typeof b.documentacion_socioeconomica === 'number' ? b.documentacion_socioeconomica : b.documentacion_socioeconomica.id })
    }
  }
  for (const r of registros.docs) {
    if (r.documento) {
      toMigrate.push({ col: 'registros-academicos', id: r.id, field: 'documento', mediaId: typeof r.documento === 'number' ? r.documento : r.documento.id })
    }
  }
  for (const h of horas.docs) {
    if (h.evidencia) {
      toMigrate.push({ col: 'horas-labor-social', id: h.id, field: 'evidencia', mediaId: typeof h.evidencia === 'number' ? h.evidencia : h.evidencia.id })
    }
  }
  
  console.log(`Encontrados ${toMigrate.length} campos para migrar.`)
  
  const mediaCache = new Map<number, number>()
  let successCount = 0
  let skipCount = 0

  for (const item of toMigrate) {
    let newPrivadoId = mediaCache.get(item.mediaId)
    
    if (!newPrivadoId) {
      // Fetch media
      const mediaDoc = await payload.findByID({ collection: 'media', id: item.mediaId }).catch(() => null)
      if (!mediaDoc || !mediaDoc.url) {
        console.warn(`[!] Media ${item.mediaId} no encontrada o sin URL.`)
        skipCount++
        continue
      }
      
      const oldPath = path.join(process.cwd(), 'media', mediaDoc.filename)
      
      if (!fs.existsSync(oldPath)) {
        console.warn(`[!] Archivo físico no encontrado para media ${item.mediaId}: ${oldPath}`)
        skipCount++
        continue
      }
      
      const buffer = fs.readFileSync(oldPath)
      
      const uploadedBy = item.col === 'horas-labor-social' 
        ? ((await payload.findByID({ collection: 'horas-labor-social', id: item.id, depth: 1 })) as any).becario?.cuenta_usuario
        : undefined;

      const newDoc = await payload.create({
        collection: 'documentos-privados',
        data: {
          alt: mediaDoc.alt,
          uploadedBy: typeof uploadedBy === 'number' ? uploadedBy : uploadedBy?.id
        },
        file: {
          data: buffer,
          mimetype: mediaDoc.mimeType || 'application/octet-stream',
          name: mediaDoc.filename || `migrated-${item.mediaId}`,
          size: mediaDoc.filesize || buffer.length,
        },
        overrideAccess: true,
      })
      
      newPrivadoId = newDoc.id
      mediaCache.set(item.mediaId, newPrivadoId)
      console.log(`Migrado Media ${item.mediaId} -> DocumentosPrivados ${newPrivadoId}`)
    }
    
    // Actualizar el documento original
    await payload.update({
      collection: item.col as any,
      id: item.id,
      data: {
        [item.field]: newPrivadoId
      },
      overrideAccess: true
    })
    
    console.log(`Actualizado ${item.col} ${item.id} -> ${item.field} = ${newPrivadoId}`)
    successCount++
  }
  
  console.log(`Migración completada. Éxito: ${successCount}, Omitidos: ${skipCount}`)
  process.exit(0)
}

run().catch(console.error)
