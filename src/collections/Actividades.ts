import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'
import { slugField } from '@/fields/slug'

// Mural y blog unificados — un solo tipo de contenido. Ver
// docs/spec.md#modelo-de-datos-colecciones.
export const Actividades: CollectionConfig = {
  slug: 'actividades',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'fecha_publicacion', 'comunidad', 'programa', 'destacada'],
  },
  access: {
    read: () => true,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('titulo'),
    {
      name: 'extracto',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'contenido',
      type: 'richText',
      localized: true,
    },
    {
      name: 'fecha_publicacion',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'portada',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'galeria',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'comunidad',
      type: 'relationship',
      relationTo: 'comunidades',
      required: true,
    },
    {
      name: 'programa',
      type: 'relationship',
      relationTo: 'programas',
    },
    {
      name: 'proyecto',
      type: 'relationship',
      relationTo: 'proyectos',
    },
    {
      name: 'destacada',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
