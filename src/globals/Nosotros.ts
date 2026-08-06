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
      name: 'secciones_resumen',
      type: 'array',
      admin: { description: 'Resumen de las líneas de trabajo de la fundación, seccionado por tipo de programa con foto — para /nosotros/programas.' },
      fields: [
        { name: 'titulo', type: 'text', required: true, localized: true },
        { name: 'texto', type: 'textarea', required: true, localized: true },
        { name: 'imagen', type: 'upload', relationTo: 'media' },
      ],
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
