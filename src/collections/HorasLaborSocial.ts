import type { Access, CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'

import { esStaffOSuperior, esStaffOSuperiorFieldAccess, idDeRelacion } from '@/access'
import { registrarAuditoria } from '@/lib/auditoria'
import type { HoraLaborSocial, User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

// Mismo patrón de acceso que RegistrosAcademicos/Recuperaciones.
const lecturaHoras: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff' || rol === 'directiva') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    return becarioId ? ({ becario: { equals: becarioId } } as Where) : false
  }
  return false
}

const creacionHoras: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  return rol === 'admin' || rol === 'staff' || rol === 'becario'
}

// El becario solo edita lo propio, y solo mientras sigue pendiente — una vez
// aprobada o rechazada, queda congelado.
const escrituraHoras: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    if (!becarioId) return false
    return { and: [{ becario: { equals: becarioId } }, { estado: { equals: 'pendiente' } }] } as Where
  }
  return false
}

const forzarPropioBecario: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation === 'create' && rolDe(req.user as User | null) === 'becario') {
    return { ...data, becario: idDeRelacion((req.user as User).becario) }
  }
  return data
}

// Quién aprobó o rechazó lo pone el sistema en el momento de la decisión, no
// un campo que el staff escriba a mano.
const autocompletarAprobador: CollectionBeforeChangeHook = ({ data, req, originalDoc }) => {
  const seEstaResolviendo = (data.estado === 'aprobada' || data.estado === 'rechazada') && data.estado !== originalDoc?.estado
  if (seEstaResolviendo && req.user) {
    return { ...data, aprobador: req.user.id }
  }
  return data
}

// "Auditoría activa sobre... horas" (3.5 del plan de ejecución).
const registrarAprobacion: CollectionAfterChangeHook<HoraLaborSocial> = async ({ doc, previousDoc, operation, req }) => {
  const seEstaResolviendo = (doc.estado === 'aprobada' || doc.estado === 'rechazada') && (operation === 'create' || doc.estado !== previousDoc?.estado)
  if (!seEstaResolviendo) return

  await registrarAuditoria(req, {
    accion: doc.estado === 'aprobada' ? 'aprobacion_horas' : 'rechazo_horas',
    coleccion: 'horas-labor-social',
    documentoId: doc.id,
    valorNuevo: { estado: doc.estado, horas: doc.horas },
  })
}

export const HorasLaborSocial: CollectionConfig = {
  slug: 'horas-labor-social',
  typescript: { interface: 'HoraLaborSocial' },
  admin: {
    useAsTitle: 'fecha',
    defaultColumns: ['becario', 'fecha', 'horas', 'estado'],
  },
  access: {
    read: lecturaHoras,
    create: creacionHoras,
    update: escrituraHoras,
    delete: esStaffOSuperior,
  },
  hooks: {
    beforeChange: [forzarPropioBecario, autocompletarAprobador],
    afterChange: [registrarAprobacion],
  },
  fields: [
    {
      name: 'becario',
      type: 'relationship',
      relationTo: 'becarios',
      required: true,
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'fecha',
      type: 'date',
      required: true,
    },
    {
      name: 'horas',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'descripcion',
      type: 'textarea',
    },
    {
      name: 'evidencia',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'pendiente',
      options: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Aprobada', value: 'aprobada' },
        { label: 'Rechazada', value: 'rechazada' },
      ],
      access: { create: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'aprobador',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, description: 'Se completa solo al aprobar o rechazar' },
      access: { create: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'comentario',
      type: 'textarea',
      admin: { description: 'Visible para el becario — especialmente útil al rechazar' },
      access: { create: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
  ],
}
