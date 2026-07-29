import type { GlobalConfig } from 'payload'

import { esStaffDirectivaOAdmin, esStaffOSuperior } from '@/access'

// Registro único, editable por el staff — ningún umbral queda escrito en el
// código. Ver 01-documento-de-proyecto.md §9 y §15.
export const Configuracion: GlobalConfig = {
  slug: 'configuracion',
  access: {
    read: esStaffDirectivaOAdmin,
    update: esStaffOSuperior,
  },
  fields: [
    {
      name: 'meta_horas_labor_social',
      type: 'number',
      required: true,
      defaultValue: 40,
      admin: {
        description: 'Meta única de horas de labor social para todos los becarios',
      },
    },
    {
      name: 'calificaciones_reprobatorias',
      type: 'array',
      admin: {
        description: 'Calificaciones que cuentan como materia reprobada',
      },
      fields: [
        {
          name: 'calificacion',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'texto_aviso_suspension',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Texto mostrado al becario suspendido explicando cómo reactivar',
      },
    },
    {
      name: 'contacto_institucional',
      type: 'group',
      fields: [
        { name: 'email', type: 'text' },
        { name: 'telefono', type: 'text' },
        { name: 'direccion', type: 'text', localized: true },
      ],
    },
  ],
}
