import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    // consentimiento_verificado y contiene_menores se agregan en el
    // siguiente paso atómico — ver docs/spec.md#modelo-de-datos-colecciones
  ],
  upload: true,
}
