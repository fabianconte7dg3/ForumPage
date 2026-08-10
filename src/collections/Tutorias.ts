import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const Tutorias: CollectionConfig = {
  slug: 'tutorias',
  admin: {
    useAsTitle: 'materia',
    defaultColumns: ['materia', 'nivel', 'sede', 'fecha_hora', 'cupo'],
  },
  access: {
    read: () => true,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  fields: [
    {
      name: 'materia',
      type: 'relationship',
      relationTo: 'materias',
      required: true,
    },
    {
      name: 'nivel',
      type: 'relationship',
      relationTo: 'niveles',
    },
    {
      name: 'sede',
      type: 'relationship',
      relationTo: 'sedes',
      required: true,
    },
    {
      name: 'fecha_hora',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'cupo',
      type: 'number',
    },
    {
      name: 'responsable',
      type: 'text',
    },
    {
      name: 'recurrencia',
      type: 'select',
      defaultValue: 'ninguna',
      options: [
        { label: 'Ninguna', value: 'ninguna' },
        { label: 'Semanal', value: 'semanal' },
        { label: 'Quincenal', value: 'quincenal' },
        { label: 'Mensual', value: 'mensual' },
      ],
    },
    {
      name: 'notas',
      type: 'textarea',
    },
    {
      name: 'realizada',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Marcalo una vez que la tutoría ocurrió, para que cuente en las cifras reales de participación',
      },
    },
    {
      name: 'participantes',
      type: 'number',
      min: 0,
      admin: {
        description: 'Cantidad real de estudiantes que asistieron',
        condition: (data) => data?.realizada === true,
      },
    },
  ],
}
