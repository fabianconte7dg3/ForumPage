import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const Sedes: CollectionConfig = {
  slug: 'sedes',
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'tipo', 'comunidad', 'destacada'],
  },
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
      localized: true,
    },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Sede principal', value: 'sede_principal' },
        { label: 'Biblioteca', value: 'biblioteca' },
        { label: 'Centro', value: 'centro' },
      ],
    },
    {
      name: 'comunidad',
      type: 'relationship',
      relationTo: 'comunidades',
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
      name: 'destacada',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'La Academia Forum / Biblioteca John Y. Keffer destaca visualmente en el mapa',
      },
    },
    {
      name: 'horario',
      type: 'text',
      localized: true,
    },
    {
      name: 'fotos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}
