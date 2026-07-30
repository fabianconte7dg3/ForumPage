import type { Access, CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'

import { esStaffOSuperior, esStaffOSuperiorFieldAccess, idDeRelacion } from '@/access'
import { materiasPendientes } from '@/lib/materias-pendientes'
import type { Recuperacion, RegistrosAcademico, User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

// Mismo patrón de acceso que RegistrosAcademicos — ver ese archivo para el
// razonamiento completo.
const lecturaRecuperaciones: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff' || rol === 'directiva') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    return becarioId ? ({ becario: { equals: becarioId } } as Where) : false
  }
  return false
}

const creacionRecuperaciones: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  return rol === 'admin' || rol === 'staff' || rol === 'becario'
}

const escrituraRecuperaciones: Access = ({ req }) => {
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

const autocompletarVerificacion: CollectionBeforeChangeHook = ({ data, req, originalDoc }) => {
  const pasaAVerificado = data.estado === 'verificado' && originalDoc?.estado !== 'verificado'
  if (pasaAVerificado && req.user) {
    return { ...data, verificado_por: req.user.id, fecha: new Date().toISOString() }
  }
  return data
}

// Reverso del automatismo de suspensión (03-runbook-tecnico.md §6.2). No basta
// con verificar UNA recuperación para reactivar: si el becario tiene varias
// materias reprobadas pendientes, tienen que quedar TODAS cubiertas por
// recuperaciones ya verificadas antes de devolverlo a activo.
const reactivarSiYaNoDebeNada: CollectionAfterChangeHook<Recuperacion> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const seAcabaDeVerificar = doc.estado === 'verificado' && (operation === 'create' || previousDoc?.estado !== 'verificado')
  if (!seAcabaDeVerificar) return

  const becarioId = idDeRelacion(doc.becario)
  if (!becarioId) return

  const becario = await req.payload.findByID({ collection: 'becarios', id: becarioId, overrideAccess: true, req })
  if (becario.estado !== 'suspendido') return

  const registros = await req.payload.find({
    collection: 'registros-academicos',
    where: { becario: { equals: becarioId }, estado_verificacion: { equals: 'verificado' } },
    limit: 1000,
    overrideAccess: true,
    req,
  })
  const recuperaciones = await req.payload.find({
    collection: 'recuperaciones',
    where: { becario: { equals: becarioId }, estado: { equals: 'verificado' } },
    limit: 1000,
    overrideAccess: true,
    req,
  })

  const pendientes = materiasPendientes(registros.docs as RegistrosAcademico[], recuperaciones.docs as Recuperacion[])
  if (pendientes.length > 0) return

  await req.payload.update({
    collection: 'becarios',
    id: becarioId,
    data: { estado: 'activo', motivo_suspension: null },
    overrideAccess: true,
    req,
  })

  await req.payload.update({
    collection: 'desembolsos',
    where: { becario: { equals: becarioId }, estado: { equals: 'retenido' } },
    data: { estado: 'programado' },
    overrideAccess: true,
    req,
  })

  if (req.user) {
    await req.payload.create({
      collection: 'auditoria',
      data: {
        actor: req.user.id,
        accion: 'reactivacion_automatica',
        coleccion: 'becarios',
        documento_id: String(becarioId),
        valor_nuevo: { estado: 'activo' },
        fecha: new Date().toISOString(),
      },
      overrideAccess: true,
      req,
    })
  }
}

export const Recuperaciones: CollectionConfig = {
  slug: 'recuperaciones',
  typescript: { interface: 'Recuperacion' },
  admin: {
    useAsTitle: 'materia',
    defaultColumns: ['becario', 'materia', 'periodo', 'estado'],
  },
  access: {
    read: lecturaRecuperaciones,
    create: creacionRecuperaciones,
    update: escrituraRecuperaciones,
    delete: esStaffOSuperior,
  },
  hooks: {
    beforeChange: [forzarPropioBecario, autocompletarVerificacion],
    afterChange: [reactivarSiYaNoDebeNada],
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
      name: 'materia',
      type: 'text',
      required: true,
      admin: { description: 'Debe coincidir con el nombre usado en materias_reprobadas del registro académico' },
    },
    {
      name: 'periodo',
      type: 'text',
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
      name: 'fecha',
      type: 'date',
      admin: { readOnly: true, description: 'Se completa sola al verificar' },
      access: { create: esStaffOSuperiorFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
  ],
}
