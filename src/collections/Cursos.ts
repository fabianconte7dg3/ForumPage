import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const Cursos: CollectionConfig = {
  slug: 'cursos',
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'tipo', 'sede', 'realizada', 'participantes'],
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
      defaultValue: 'estudiantes',
      options: [
        { label: 'Estudiantes', value: 'estudiantes' },
        { label: 'Adultos', value: 'adultos' },
      ],
    },
    {
      name: 'sede',
      type: 'relationship',
      relationTo: 'sedes',
    },
    {
      name: 'fecha_inicio',
      type: 'date',
    },
    {
      name: 'responsable',
      type: 'text',
    },
    {
      name: 'realizada',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Marcalo una vez que el curso ocurrió, para que cuente en las cifras reales de participación',
      },
    },
    {
      name: 'participantes',
      type: 'number',
      min: 0,
      admin: {
        description: 'Cantidad real de participantes',
        condition: (data) => data?.realizada === true,
      },
    },
    {
      name: 'notas',
      type: 'textarea',
    },
  ],
}
