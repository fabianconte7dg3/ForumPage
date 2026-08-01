import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { esStaffOSuperior, soloPropioOStaff } from '@/access'

// Asigna automáticamente el creador del documento si hay usuario autenticado.
const autocompletarPropietario: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation === 'create' && req.user && !data.uploadedBy) {
    data.uploadedBy = req.user.id
  }
  return data
}

export const DocumentosPrivados: CollectionConfig = {
  slug: 'documentos-privados',
  access: {
    // El staff/admin puede ver todo; el becario solo lo que él mismo subió.
    read: soloPropioOStaff,
    create: soloPropioOStaff,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  upload: {
    // Para documentos no necesitamos todos los image sizes de Media público,
    // pero mantenemos lo mínimo si suben imágenes.
    imageSizes: [
      { name: 'thumbnail', width: 400 },
    ],
  },
  hooks: {
    beforeChange: [autocompletarPropietario],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
}
