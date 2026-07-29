import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// El color y el ícono generan automáticamente los filtros del mapa —
// ver docs/spec.md#modelo-de-datos-colecciones.
export const Programas: CollectionConfig = {
  slug: 'programas',
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'color', 'activo'],
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
      name: 'descripcion',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'color',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || /^#[0-9A-Fa-f]{6}$/.test(value)) return true
        return 'Debe ser un color hexadecimal, ej. #17423B'
      },
    },
    {
      name: 'icono',
      type: 'text',
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
