import type { CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

export const GirasEducativas: CollectionConfig = {
  slug: 'giras-educativas',
  typescript: { interface: 'GiraEducativa' },
  admin: {
    useAsTitle: 'destino',
    defaultColumns: ['destino', 'escuela', 'fecha', 'realizada', 'participantes'],
  },
  access: {
    read: () => true,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  fields: [
    {
      name: 'destino',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ej. Biomuseo, Ruinas de Panamá Viejo' },
    },
    {
      name: 'escuela',
      type: 'relationship',
      relationTo: 'centros-educativos',
      required: true,
    },
    {
      name: 'nivel',
      type: 'relationship',
      relationTo: 'niveles',
    },
    {
      name: 'fecha',
      type: 'date',
    },
    {
      name: 'realizada',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Marcalo una vez que la gira ocurrió, para que cuente en las cifras reales de participación',
      },
    },
    {
      name: 'participantes',
      type: 'number',
      min: 0,
      admin: {
        description: 'Cantidad real de estudiantes que participaron',
        condition: (data) => data?.realizada === true,
      },
    },
    {
      name: 'notas',
      type: 'textarea',
    },
  ],
}
