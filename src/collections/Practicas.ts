import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// Tres modalidades a elección del staff en un mismo formulario — ver
// 01-documento-de-proyecto.md §4.5.
export const Practicas: CollectionConfig = {
  slug: 'practicas',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'nivel', 'materia', 'modalidad'],
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
      name: 'nivel',
      type: 'relationship',
      relationTo: 'niveles',
    },
    {
      name: 'materia',
      type: 'relationship',
      relationTo: 'materias',
    },
    {
      name: 'modalidad',
      type: 'select',
      required: true,
      options: [
        { label: 'Descargable', value: 'descargable' },
        { label: 'Quiz autocorregido', value: 'quiz_autocorregido' },
        { label: 'Quiz con progreso', value: 'quiz_con_progreso' },
      ],
    },
    {
      name: 'archivo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.modalidad === 'descargable',
      },
    },
    {
      name: 'preguntas',
      type: 'array',
      admin: {
        condition: (data) => data?.modalidad === 'quiz_autocorregido' || data?.modalidad === 'quiz_con_progreso',
      },
      fields: [
        {
          name: 'enunciado',
          type: 'textarea',
          required: true,
          localized: true,
        },
        {
          name: 'opciones',
          type: 'array',
          minRows: 2,
          fields: [
            {
              name: 'texto',
              type: 'text',
              required: true,
              localized: true,
            },
          ],
        },
        {
          name: 'respuesta_correcta',
          type: 'number',
          required: true,
          admin: {
            description: 'Índice (empezando en 0) de la opción correcta',
          },
        },
        {
          name: 'retroalimentacion',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
}
