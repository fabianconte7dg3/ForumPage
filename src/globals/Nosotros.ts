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
    {
      name: 'resumen',
      type: 'richText',
      localized: true,
      admin: { description: 'Resumen de las líneas de trabajo de la fundación, para /nosotros/programas.' },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Foto que acompaña la misión/historia' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
