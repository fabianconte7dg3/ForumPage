import type { GlobalConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// Contenido de /nosotros (misión + historia) — texto singleton de la página,
// no un listado, por eso global y no colección. Ver docs/spec.md#modelo-de-datos-colecciones.
export const Nosotros: GlobalConfig = {
  slug: 'nosotros',
  access: {
    read: () => true,
    update: esStaffOSuperior,
  },
  fields: [
    {
      name: 'mision',
      type: 'richText',
      localized: true,
    },
    {
      name: 'historia',
      type: 'richText',
      localized: true,
    },
  ],
}
