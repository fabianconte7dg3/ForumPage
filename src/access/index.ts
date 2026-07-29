import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

// Funciones de control de acceso reutilizables — ver 03-runbook-tecnico.md §7.1
// y la matriz de permisos en docs/spec.md#control-de-acceso-iam.
//
// esPropioBecario y soloPendientes se agregan cuando exista la colección
// Becarios/RegistrosAcademicos (Bloque 5).

const rolDe = (user: User | null): User['rol'] | undefined => user?.rol

export const esAdmin: Access<User> = ({ req }) => rolDe(req.user) === 'admin'

export const esStaffOSuperior: Access<User> = ({ req }) => ['staff', 'admin'].includes(rolDe(req.user) ?? '')

export const esDirectivaOSuperior: Access<User> = ({ req }) => ['directiva', 'admin'].includes(rolDe(req.user) ?? '')

export const esStaffDirectivaOAdmin: Access<User> = ({ req }) =>
  ['staff', 'directiva', 'admin'].includes(rolDe(req.user) ?? '')

export const publicoOAutenticado: Access = () => true

export const esAdminFieldAccess: FieldAccess = ({ req }) => (req.user as User | null)?.rol === 'admin'

// Para campos que revelarían la respuesta correcta de un quiz si la colección
// es de lectura pública (ej. Practicas) — la API expone todo lo que el access
// permita, así que la respuesta debe quedar fuera del alcance público incluso
// si el resto de la colección no lo está. Ver CLAUDE.md, "control de acceso".
export const esStaffOSuperiorFieldAccess: FieldAccess = ({ req }) =>
  ['staff', 'admin'].includes(rolDe(req.user as User | null) ?? '')
