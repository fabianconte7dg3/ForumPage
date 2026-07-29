import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// Taxonomía simple, editable por el staff — nunca hardcodeada.
export const Niveles: CollectionConfig = {
  slug: 'niveles',
  typescript: { interface: 'Nivel' },
  admin: {
    useAsTitle: 'nombre',
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
  ],
}
