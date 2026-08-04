import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const DestinosInternacionales: CollectionConfig = {
  slug: 'destinos-internacionales',
  admin: {
    useAsTitle: 'universidad',
    defaultColumns: ['universidad', 'pais', 'ciudad'],
    description: 'Destinos frecuentes sugeridos al registrar un becario internacional.',
  },
  access: {
    read: () => true,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  fields: [
    {
      name: 'universidad',
      type: 'text',
      required: true,
    },
    {
      name: 'pais',
      type: 'text',
      required: true,
    },
    {
      name: 'ciudad',
      type: 'text',
      required: true,
    },
    {
      name: 'coordenadas',
      type: 'group',
      fields: [
        { name: 'lat', type: 'number', required: true, min: -90, max: 90 },
        { name: 'lng', type: 'number', required: true, min: -180, max: 180 },
      ],
    },
    {
      name: 'bandera',
      type: 'text',
      admin: {
        description: 'Emoji de bandera para el selector, ej. 🇮🇹',
      },
    },
  ],
}
