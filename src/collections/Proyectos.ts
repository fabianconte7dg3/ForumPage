import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const Proyectos: CollectionConfig = {
  slug: 'proyectos',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'comunidad', 'programa', 'estado', 'avance'],
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
    {
      name: 'programa',
      type: 'relationship',
      relationTo: 'programas',
    },
    {
      name: 'comunidad',
      type: 'relationship',
      relationTo: 'comunidades',
      required: true,
    },
    {
      name: 'centro_educativo',
      type: 'relationship',
      relationTo: 'centros-educativos',
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'propuesto',
      options: [
        { label: 'Propuesto', value: 'propuesto' },
        { label: 'Aprobado', value: 'aprobado' },
        { label: 'En ejecución', value: 'en_ejecucion' },
        { label: 'Completado', value: 'completado' },
      ],
    },
    {
      name: 'fecha_inicio',
      type: 'date',
    },
    {
      name: 'fecha_fin',
      type: 'date',
    },
    {
      name: 'monto',
      type: 'number',
    },
    {
      name: 'avance',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
    },
    {
      name: 'foto_antes',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'foto_despues',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
