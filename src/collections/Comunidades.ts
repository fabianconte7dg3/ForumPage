import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'
import { slugField } from '@/fields/slug'

// La Comunidad es el eje del sistema — todo apunta a ella. Ver
// docs/spec.md#modelo-de-datos-colecciones.
export const Comunidades: CollectionConfig = {
  slug: 'comunidades',
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'distrito', 'corregimiento'],
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
    slugField('nombre'),
    {
      name: 'distrito',
      type: 'text',
      required: true,
    },
    {
      name: 'corregimiento',
      type: 'text',
    },
    {
      name: 'coordenadas',
      type: 'group',
      admin: {
        description: 'Centroide de la comunidad, nunca un domicilio',
      },
      fields: [
        { name: 'lat', type: 'number', required: true, min: -90, max: 90 },
        { name: 'lng', type: 'number', required: true, min: -180, max: 180 },
      ],
    },
    {
      name: 'descripcion',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
