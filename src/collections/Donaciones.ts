import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const Donaciones: CollectionConfig = {
  slug: 'donaciones',
  typescript: { interface: 'Donacion' },
  admin: {
    useAsTitle: 'institucion',
    defaultColumns: ['institucion', 'tipo_institucion', 'fecha'],
  },
  access: {
    read: () => true,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  fields: [
    {
      name: 'institucion',
      type: 'text',
      required: true,
      admin: { description: 'Ej. Escuela Membrillo, U. Tecnológica de Panamá - Coclé' },
    },
    {
      name: 'tipo_institucion',
      type: 'select',
      defaultValue: 'escuela',
      options: [
        { label: 'Escuela', value: 'escuela' },
        { label: 'Universidad', value: 'universidad' },
        { label: 'Centro de salud', value: 'centro_salud' },
        { label: 'Iglesia', value: 'iglesia' },
        { label: 'Otro', value: 'otro' },
      ],
    },
    {
      name: 'comunidad',
      type: 'relationship',
      relationTo: 'comunidades',
    },
    {
      name: 'descripcion',
      type: 'textarea',
      localized: true,
      admin: { description: 'Qué se donó' },
    },
    {
      name: 'fecha',
      type: 'date',
    },
  ],
}
