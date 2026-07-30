import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// Miembros del equipo mostrados en /nosotros — editable por el staff, no
// hardcodeado (CLAUDE.md). `destacado` da al fundador una tarjeta más grande
// en la grilla, igual que en el sitio original.
export const Equipo: CollectionConfig = {
  slug: 'equipo',
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'cargo', 'orden'],
  },
  defaultSort: 'orden',
  access: {
    read: () => true,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'cargo',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'destacado',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Tarjeta más grande en la grilla — para el fundador' },
    },
    {
      name: 'orden',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Orden de aparición, menor primero' },
    },
  ],
}
