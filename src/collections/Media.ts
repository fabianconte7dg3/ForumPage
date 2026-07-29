import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
      { name: 'og', width: 1200, height: 630 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'consentimiento_verificado',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Requerido antes de publicar si contiene_menores está activo',
      },
    },
    {
      name: 'contiene_menores',
      type: 'checkbox',
      defaultValue: false,
      validate: (value, { siblingData }) => {
        const data = siblingData as { consentimiento_verificado?: boolean }
        if (value && !data?.consentimiento_verificado) {
          return 'No se puede marcar "contiene menores" sin consentimiento_verificado del acudiente'
        }
        return true
      },
    },
  ],
}
