import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// Centro de Aprendizaje: sin cuenta, sin datos personales. `fuente_y_licencia`
// es obligatorio por restricción legal (no se pueden subir libros de texto
// escaneados) — ver docs/spec.md#modelo-de-datos-colecciones.
export const Recursos: CollectionConfig = {
  slug: 'recursos',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tipo', 'nivel', 'materia', 'idioma'],
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
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'PDF propio', value: 'pdf_propio' },
        { label: 'Enlace externo', value: 'enlace_externo' },
        { label: 'Video de YouTube', value: 'video_youtube' },
        { label: 'Práctica', value: 'practica' },
      ],
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
      name: 'idioma',
      type: 'select',
      required: true,
      defaultValue: 'es',
      admin: {
        description: 'Idioma del recurso, no una localización — un video en inglés sigue siendo contenido pedagógico en inglés',
      },
      options: [
        { label: 'Español', value: 'es' },
        { label: 'Inglés', value: 'en' },
      ],
    },
    {
      name: 'archivo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.tipo === 'pdf_propio',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (data) => data?.tipo === 'enlace_externo' || data?.tipo === 'video_youtube',
      },
    },
    {
      name: 'fuente_y_licencia',
      type: 'text',
      required: true,
      admin: {
        description: 'De dónde viene el recurso y bajo qué licencia se puede publicar',
      },
    },
  ],
}
