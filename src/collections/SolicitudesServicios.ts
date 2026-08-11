import type { CollectionConfig } from 'payload'

import { esStaffDirectivaOAdmin, esStaffOSuperior } from '@/access'

export const SolicitudesServicios: CollectionConfig = {
  slug: 'solicitudes-servicios',
  typescript: { interface: 'SolicitudServicio' },
  admin: {
    useAsTitle: 'solicitante',
    defaultColumns: ['solicitante', 'canal', 'tipo_servicio', 'estado', 'fecha_solicitud'],
  },
  access: {
    read: esStaffDirectivaOAdmin,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  fields: [
    {
      name: 'solicitante',
      type: 'text',
      required: true,
      admin: { description: 'Nombre del estudiante, docente, acudiente o institución que solicita el servicio' },
    },
    {
      name: 'comunidad',
      type: 'relationship',
      relationTo: 'comunidades',
      admin: { description: 'Comunidad de origen del solicitante (opcional)' },
    },
    {
      name: 'canal',
      type: 'select',
      required: true,
      defaultValue: 'whatsapp',
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Carta Física', value: 'carta' },
      ],
      admin: { description: 'Canal por el cual se recibió la solicitud' },
    },
    {
      name: 'tipo_servicio',
      type: 'select',
      required: true,
      defaultValue: 'impresion_copia',
      options: [
        { label: 'Impresiones / Fotocopias', value: 'impresion_copia' },
        { label: 'Materiales / Compras', value: 'materiales_compras' },
        { label: 'Ambos (Impresiones y Materiales)', value: 'ambos' },
      ],
      admin: { description: 'Categoría del servicio gratuito brindado por la fundación' },
    },
    {
      name: 'descripcion',
      type: 'textarea',
      required: true,
      admin: { description: 'Detalle de lo solicitado (ej. 25 copias de folleto de español, 3 cuadernos)' },
    },
    {
      name: 'cantidad_hojas',
      type: 'number',
      admin: { description: 'Número total de páginas/hojas impresas o fotocopiadas (opcional)' },
    },
    {
      name: 'documento_solicitud',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Foto de la carta física o captura de pantalla del mensaje de WhatsApp' },
    },
    {
      name: 'lugar_retiro',
      type: 'text',
      required: true,
      defaultValue: 'Auditorio',
      admin: { description: 'Ubicación física donde se retira el trabajo impreso o insumos' },
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'recibida',
      options: [
        { label: 'Recibida', value: 'recibida' },
        { label: 'En preparación', value: 'en_preparacion' },
        { label: 'Lista para retirar (Auditorio)', value: 'lista_para_retirar' },
        { label: 'Entregada', value: 'entregada' },
        { label: 'Cancelada', value: 'cancelada' },
      ],
      admin: { description: 'Estado en la línea de trazabilidad' },
    },
    {
      name: 'fecha_solicitud',
      type: 'date',
      required: true,
      admin: { description: 'Fecha y hora en que se recibió la solicitud' },
    },
    {
      name: 'fecha_entrega',
      type: 'date',
      admin: { description: 'Fecha y hora en que se entregó efectivamente en el Auditorio' },
    },
    {
      name: 'recibido_por',
      type: 'text',
      admin: { description: 'Nombre de la persona que se presentó en el Auditorio a retirar' },
    },
    {
      name: 'comprobante_entrega',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Foto del acta o recibo firmado al momento de entregar' },
    },
    {
      name: 'observaciones',
      type: 'textarea',
      admin: { description: 'Notas internas del staff sobre el seguimiento o entrega' },
    },
  ],
}
