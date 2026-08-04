import type { Access, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { esStaffDirectivaOAdminFieldAccess, esStaffOSuperior } from '@/access'
import type { Necesidade, User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

// `prioridad` es texto (alta/media/baja) y ordenarlo alfabéticamente da
// "alta, baja, media" — no la prioridad real. Este campo numérico oculto se
// mantiene sincronizado para poder ordenar de verdad (cola priorizada de la
// directiva).
const ORDEN_PRIORIDAD: Record<Necesidade['prioridad'], number> = { alta: 1, media: 2, baja: 3 }

const sincronizarOrdenPrioridad: CollectionBeforeChangeHook<Necesidade> = ({ data }) => {
  if (data.prioridad) {
    return { ...data, prioridad_orden: ORDEN_PRIORIDAD[data.prioridad as Necesidade['prioridad']] }
  }
  return data
}

// Público y becario ven exactamente lo mismo acá: solo lo que el staff marcó
// como `visible_publicamente` (01-documento-de-proyecto.md §10, matriz de
// permisos — "Lectura (si públicas)" en ambas columnas). Staff/directiva/admin
// ven la cola completa, incluidas las que todavía no se muestran a nadie.
const lecturaNecesidades: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff' || rol === 'directiva') return true
  return { visible_publicamente: { equals: true } }
}

// Alta solo por el staff — el formulario público de solicitud (próximo paso)
// no usará este `create` directo: va a insertar por una acción de servidor
// con overrideAccess, mismo patrón que ya usa `calificarPractica`, para no
// dejar un POST público abierto a la API sin límite de tasa.
export const Necesidades: CollectionConfig = {
  slug: 'necesidades',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'comunidad', 'prioridad', 'estado', 'visible_publicamente'],
  },
  access: {
    read: lecturaNecesidades,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  hooks: {
    beforeChange: [sincronizarOrdenPrioridad],
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'comunidad',
      type: 'relationship',
      relationTo: 'comunidades',
      required: true,
    },
    // Quién la reportó (una persona de la comunidad o escuela, sin cuenta en
    // el sistema) — nunca se muestra públicamente, aunque la necesidad en sí
    // sea visible. Directiva sí lo ve: su rol ya es de lectura total.
    {
      name: 'solicitante',
      type: 'text',
      admin: { description: 'Quién reportó la necesidad — nunca visible públicamente' },
      access: { read: esStaffDirectivaOAdminFieldAccess },
    },
    {
      name: 'descripcion',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'prioridad',
      type: 'select',
      required: true,
      defaultValue: 'media',
      options: [
        { label: 'Baja', value: 'baja' },
        { label: 'Media', value: 'media' },
        { label: 'Alta', value: 'alta' },
      ],
    },
    {
      name: 'prioridad_orden',
      type: 'number',
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'costo_estimado',
      type: 'number',
      admin: { description: 'Estimación interna — nunca visible públicamente, mismo criterio que solicitante' },
      access: { read: esStaffDirectivaOAdminFieldAccess },
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'recibida',
      admin: { description: 'La barra de progreso pública mide esto — estado del caso, no dinero recaudado' },
      options: [
        { label: 'Recibida', value: 'recibida' },
        { label: 'En evaluación', value: 'en_evaluacion' },
        { label: 'Aprobada', value: 'aprobada' },
        { label: 'En ejecución', value: 'en_ejecucion' },
        { label: 'Completada', value: 'completada' },
      ],
    },
    {
      name: 'proyecto_resultante',
      type: 'relationship',
      relationTo: 'proyectos',
      admin: { description: 'Se vincula una vez que se ejecuta y se documenta como Proyecto' },
    },
    {
      name: 'visible_publicamente',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'El staff decide cuándo mostrarla en la cola pública — recién recibida, probablemente no todavía' },
    },
  ],
}
