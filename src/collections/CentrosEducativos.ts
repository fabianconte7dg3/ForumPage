import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// niveles_atendidos queda como texto libre hasta que exista la colección
// Niveles (Bloque 4) — entonces se convierte en relationship.
export const CentrosEducativos: CollectionConfig = {
  slug: 'centros-educativos',
  typescript: { interface: 'CentroEducativo' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'comunidad', 'matricula_aproximada'],
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
      name: 'niveles_atendidos',
      type: 'text',
      localized: true,
    },
    {
      name: 'matricula_aproximada',
      type: 'number',
    },
    {
      name: 'contacto',
      type: 'text',
    },
  ],
}
