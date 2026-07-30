import type { Access, CollectionAfterChangeHook, CollectionConfig, Where } from 'payload'

import { esStaffOSuperior, idDeRelacion } from '@/access'
import { registrarAuditoria } from '@/lib/auditoria'
import type { Desembolso, User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

// Público: sin acceso. Becario: solo lee lo propio (nunca crea ni edita — el
// calendario de pagos lo controla el staff). Staff/directiva/admin: como el
// resto de las colecciones de Becarios.
const lecturaDesembolsos: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff' || rol === 'directiva') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    return becarioId ? ({ becario: { equals: becarioId } } as Where) : false
  }
  return false
}

// "Auditoría activa sobre... desembolsos" (3.5 del plan de ejecución) — toda
// transición de estado, sea manual (staff marca pagado/cancelado) o en
// cascada (el automatismo de suspensión/reactivación retiene o libera varios
// a la vez con un `where`, y cada uno pasa por este mismo hook igual).
const registrarCambioEstado: CollectionAfterChangeHook<Desembolso> = async ({ doc, previousDoc, operation, req }) => {
  const cambioEstado = operation === 'update' && !!previousDoc && doc.estado !== previousDoc.estado
  if (!cambioEstado) return

  await registrarAuditoria(req, {
    accion: 'cambio_estado_desembolso',
    coleccion: 'desembolsos',
    documentoId: doc.id,
    valorAnterior: { estado: previousDoc.estado },
    valorNuevo: { estado: doc.estado },
  })
}

export const Desembolsos: CollectionConfig = {
  slug: 'desembolsos',
  typescript: { interface: 'Desembolso' },
  admin: {
    useAsTitle: 'concepto',
    defaultColumns: ['becario', 'monto', 'fecha_programada', 'estado'],
  },
  access: {
    read: lecturaDesembolsos,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    // Nunca se borran, ni siquiera el admin — un desembolso suspendido pasa a
    // "retenido" y uno anulado a "cancelado", pero el registro se conserva
    // siempre (01-documento-de-proyecto.md §9: "los desembolsos nunca se
    // eliminan al suspender"). Es dinero real: el historial es el punto.
    delete: () => false,
  },
  hooks: {
    afterChange: [registrarCambioEstado],
  },
  fields: [
    {
      name: 'becario',
      type: 'relationship',
      relationTo: 'becarios',
      required: true,
    },
    {
      name: 'monto',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'fecha_programada',
      type: 'date',
      required: true,
    },
    {
      name: 'fecha_efectiva',
      type: 'date',
      admin: { description: 'Se completa cuando el pago realmente sale' },
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'programado',
      options: [
        { label: 'Programado', value: 'programado' },
        { label: 'Retenido', value: 'retenido' },
        { label: 'Pagado', value: 'pagado' },
        { label: 'Cancelado', value: 'cancelado' },
      ],
    },
    {
      name: 'concepto',
      type: 'text',
    },
  ],
}
