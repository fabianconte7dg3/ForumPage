import type { Access, CollectionConfig } from 'payload'

import { esStaffDirectivaOAdminFieldAccess, esStaffOSuperior } from '@/access'
import type { User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

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
      name: 'costo_estimado',
      type: 'number',
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
