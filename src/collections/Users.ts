import type { CollectionAfterLoginHook, CollectionBeforeLoginHook, CollectionConfig } from 'payload'

import { esAdmin, esAdminFieldAccess } from '@/access'

// Cuenta desactivada (baja de personal, no borrado) no puede iniciar sesión
// aunque la contraseña siga siendo válida (05-ciberseguridad.md "procedimiento
// de baja": desactivar, no eliminar).
const bloquearInactivos: CollectionBeforeLoginHook = ({ user }) => {
  if (!user.activo) {
    throw new Error('Esta cuenta está desactivada')
  }
}

const registrarUltimoAcceso: CollectionAfterLoginHook = async ({ user, req }) => {
  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { ultimo_acceso: new Date().toISOString() },
    overrideAccess: true,
    req,
  })
}

// IAM — ver docs/spec.md#control-de-acceso-iam y 03-runbook-tecnico.md §7.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'rol', 'activo'],
  },
  auth: true,
  hooks: {
    beforeLogin: [bloquearInactivos],
    afterLogin: [registrarUltimoAcceso],
  },
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
    {
      name: 'ultimo_acceso',
      type: 'date',
      admin: { readOnly: true, description: 'Se completa solo en cada login exitoso' },
      access: { create: esAdminFieldAccess, update: esAdminFieldAccess },
    },
    {
      name: 'becario',
      type: 'relationship',
      relationTo: 'becarios',
      admin: {
        condition: (data) => data?.rol === 'becario',
        description: 'El registro de becario vinculado a esta cuenta',
      },
      // Un becario no puede vincularse a sí mismo a otro expediente.
      access: {
        update: esAdminFieldAccess,
      },
    },
  ],
  versions: false,
}
