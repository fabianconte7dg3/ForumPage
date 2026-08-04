import type { Access, CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'
import type { User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

// La foto de un becario es pública solo mientras su consentimiento
// (Becarios.mostrar_en_mapa) siga activo — `publica` se mantiene sincronizado
// desde el hook afterChange de Becarios, nunca se edita a mano acá. Sin esto,
// apagar mostrar_en_mapa ocultaba al becario de /api/becarios pero su foto
// seguía sirviéndose para siempre en /api/media/file/<nombre>.
const lecturaFotosBecarios: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (['admin', 'staff', 'directiva'].includes(rol ?? '')) return true
  return { publica: { equals: true } }
}

export const FotosBecarios: CollectionConfig = {
  slug: 'fotos-becarios',
  access: {
    read: lecturaFotosBecarios,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  upload: {
    imageSizes: [{ name: 'thumbnail', width: 400 }],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'publica',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Se sincroniza solo desde Becarios.mostrar_en_mapa — no editar a mano.',
      },
    },
  ],
}
