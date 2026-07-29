import type { CollectionConfig } from 'payload'

import { esAdmin, esAdminFieldAccess } from '@/access'

// IAM — ver docs/spec.md#control-de-acceso-iam y 03-runbook-tecnico.md §7.
// El campo `becario` (relación, solo rol becario) se agrega cuando exista
// la colección Becarios (Bloque 5).
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'rol', 'activo'],
  },
  auth: true,
  access: {
    create: esAdmin,
    read: ({ req }) => {
      if ((req.user as { rol?: string } | null)?.rol === 'admin') return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    update: ({ req }) => {
      if ((req.user as { rol?: string } | null)?.rol === 'admin') return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    delete: esAdmin,
  },
  fields: [
    {
      name: 'rol',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Staff', value: 'staff' },
        { label: 'Directiva', value: 'directiva' },
        { label: 'Becario', value: 'becario' },
      ],
      // Un usuario no-admin no puede escalar su propio rol.
      access: {
        update: esAdminFieldAccess,
      },
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
      // Cuentas se desactivan, nunca se borran — solo admin puede reactivar/desactivar.
      access: {
        update: esAdminFieldAccess,
      },
    },
  ],
  versions: false,
}
