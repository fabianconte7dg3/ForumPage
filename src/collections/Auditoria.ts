import type { CollectionConfig } from 'payload'

import { esDirectivaOSuperior } from '@/access'

// Solo escritura desde hooks (overrideAccess por defecto en llamadas internas
// de Payload) — nunca desde el panel ni la API pública. Ver
// 03-runbook-tecnico.md §5 Bloque 1 y 05-ciberseguridad.md §3.1.
export const Auditoria: CollectionConfig = {
  slug: 'auditoria',
  admin: {
    useAsTitle: 'accion',
    defaultColumns: ['fecha', 'actor', 'accion', 'coleccion'],
  },
  access: {
    create: () => false,
    read: esDirectivaOSuperior,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'accion',
      type: 'text',
      required: true,
    },
    {
      name: 'coleccion',
      type: 'text',
      required: true,
    },
    {
      name: 'documento_id',
      type: 'text',
      required: true,
    },
    {
      name: 'valor_anterior',
      type: 'json',
    },
    {
      name: 'valor_nuevo',
      type: 'json',
    },
    {
      name: 'fecha',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'ip',
      type: 'text',
    },
  ],
}
