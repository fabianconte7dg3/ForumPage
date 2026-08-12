import type { Access, CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'

import { esStaffOSuperior, esStaffOSuperiorFieldAccess, idDeRelacion } from '@/access'
import { registrarAuditoria } from '@/lib/auditoria'
import type { RegistrosAcademico, User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

// Público: sin acceso. Becario: solo los propios. Staff/directiva/admin: todos.
const lecturaRegistros: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff' || rol === 'directiva') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    return becarioId ? ({ becario: { equals: becarioId } } as Where) : false
  }
  return false
}

const creacionRegistros: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  return rol === 'admin' || rol === 'staff' || rol === 'becario'
}

// El becario solo edita su propio registro, y solo mientras está pendiente —
// una vez verificado queda congelado (01-documento-de-proyecto.md §10,
// "Reglas por rol"). Staff y admin, siempre.
const escrituraRegistros: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    if (!becarioId) return false
    return {
      and: [{ becario: { equals: becarioId } }, { estado_verificacion: { equals: 'pendiente' } }],
    } as Where
  }
  return false
}

// Un becario no puede crear el registro de otro becario, sin importar qué
// envíe el formulario — se fuerza server-side, no se confía en el cliente.
const forzarPropioBecario: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation === 'create' && rolDe(req.user as User | null) === 'becario') {
    return { ...data, becario: idDeRelacion((req.user as User).becario) }
  }
  return data
}

// "Firmado y fechado": quién verificó y cuándo lo pone el sistema al momento
// de la transición, no un campo que el staff escriba a mano.
const autocompletarVerificacion: CollectionBeforeChangeHook = ({ data, req, originalDoc }) => {
  const pasaAVerificado = data.estado_verificacion === 'verificado' && originalDoc?.estado_verificacion !== 'verificado'
  if (pasaAVerificado && req.user) {
    return { ...data, verificado_por: req.user.id, fecha_verificacion: new Date().toISOString() }
  }
  return data
}

// El automatismo central de Fase 3 (03-runbook-tecnico.md §6.1): verificar un
// registro con materias reprobadas suspende al becario, sin intervención
// manual. Se dispara solo en la transición hacia "verificado" (no en cada
// re-guardado de un registro ya verificado) para no reprocesar de más.
const suspenderPorReprobacion: CollectionAfterChangeHook<RegistrosAcademico> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const seAcabaDeVerificar =
    doc.estado_verificacion === 'verificado' && (operation === 'create' || previousDoc?.estado_verificacion !== 'verificado')
  if (!seAcabaDeVerificar) return

  const becarioId = typeof doc.becario === 'object' ? doc.becario.id : doc.becario

  // "Auditoría activa sobre... verificaciones" (3.5 del plan de ejecución) —
  // se registra la verificación en sí, exista o no materia reprobada, no solo
  // cuando dispara la suspensión.
  await registrarAuditoria(req, {
    accion: 'verificacion_registro_academico',
    coleccion: 'registros-academicos',
    documentoId: doc.id,
    valorNuevo: { periodo: doc.periodo, materias_reprobadas: doc.materias_reprobadas },
  })

  const materiasReprobadas = doc.materias_reprobadas ?? []
  if (materiasReprobadas.length === 0) return

  const motivo = `Materia(s) reprobada(s): ${materiasReprobadas.map((m) => m.nombre).join(', ')}`

  await req.payload.update({
    collection: 'becarios',
    id: becarioId,
    data: { estado: 'suspendido', motivo_suspension: motivo, fecha_suspension: new Date().toISOString() },
    overrideAccess: true,
    req,
  })

  await req.payload.update({
    collection: 'desembolsos',
    where: { becario: { equals: becarioId }, estado: { equals: 'programado' } },
    data: { estado: 'retenido' },
    overrideAccess: true,
    req,
  })

  await registrarAuditoria(req, {
    accion: 'suspension_automatica',
    coleccion: 'becarios',
    documentoId: becarioId,
    valorNuevo: { estado: 'suspendido', motivo_suspension: motivo },
  })
}

export const RegistrosAcademicos: CollectionConfig = {
  slug: 'registros-academicos',
  typescript: { interface: 'RegistrosAcademico' },
  admin: {
    useAsTitle: 'periodo',
    defaultColumns: ['becario', 'periodo', 'estado_verificacion'],
  },
  access: {
    read: lecturaRegistros,
    create: creacionRegistros,
    update: escrituraRegistros,
    delete: esStaffOSuperior,
  },
  hooks: {
    beforeChange: [forzarPropioBecario, autocompletarVerificacion],
    afterChange: [suspenderPorReprobacion],
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
      name: 'periodo',
      type: 'text',
      required: true,
      admin: { description: 'Ej. "2026-1"' },
    },
    {
      name: 'universidad',
      type: 'text',
    },
    {
      name: 'materias_aprobadas',
      type: 'array',
      fields: [
        { name: 'nombre', type: 'text', required: true },
        { name: 'calificacion', type: 'text', required: true },
      ],
    },
    {
      name: 'materias_reprobadas',
      type: 'array',
      admin: { description: 'Si tiene al menos una materia acá, verificar este registro suspende al becario automáticamente' },
      fields: [
        { name: 'nombre', type: 'text', required: true },
        { name: 'calificacion', type: 'text', required: true },
      ],
    },
    {
      name: 'indice',
      type: 'number',
      admin: { description: 'Índice académico del período' },
    },
    {
      name: 'documento_matricula',
      type: 'upload',
      relationTo: 'documentos-privados',
      admin: { description: 'Constancia de matrícula del período' },
    },
    {
      name: 'documento_creditos',
      type: 'upload',
      relationTo: 'documentos-privados',
      admin: { description: 'Reporte de créditos / notas del período' },
    },
    {
      name: 'estado_verificacion',
      type: 'select',
      required: true,
      defaultValue: 'pendiente',
      options: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Verificado', value: 'verificado' },
      ],
      access: { create: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'verificado_por',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, description: 'Se completa solo al verificar' },
      access: { create: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'fecha_verificacion',
      type: 'date',
      admin: { readOnly: true, description: 'Se completa sola al verificar' },
      access: { create: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
    // Distinto de Becarios.motivo_suspension (lo que ve el becario): esta es
    // la nota privada del staff sobre su propia evaluación — nunca la ve el
    // becario ni la directiva (01-documento-de-proyecto.md §10, "Reglas a
    // nivel de campo").
    {
      name: 'nota_interna_evaluacion',
      type: 'textarea',
      admin: { description: 'Privado del staff evaluador — nunca lo ve el becario ni la directiva' },
      access: { create: esStaffOSuperiorFieldAccess, read: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
  ],
}
