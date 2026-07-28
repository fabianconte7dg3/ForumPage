import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Roles (admin/staff/directiva/becario) y demás campos de IAM se agregan
    // en el siguiente paso atómico — ver docs/spec.md#control-de-acceso-iam
  ],
  versions: false,
}
