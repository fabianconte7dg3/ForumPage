import type { Access, CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, FieldAccess, Where } from 'payload'

import { esStaffOSuperior, esStaffOSuperiorFieldAccess, esStaffDirectivaOAdminFieldAccess, idDeRelacion } from '@/access'
import type { Becario, User } from '@/payload-types'

const rolDe = (user: User | null) => user?.rol

// El estado del becario (activo/suspendido/...) y su motivo NUNCA se hacen
// públicos, ni siquiera de forma agregada — no-negociable de CLAUDE.md. La API
// expone todo lo que el access permita, así que esto se restringe por campo,
// no solo filtrando qué documentos se listan.
const soloPropioOStaffField: FieldAccess = ({ req, doc }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff' || rol === 'directiva') return true
  const becarioId = idDeRelacion((req.user as User | null)?.becario)
  return !!becarioId && doc?.id === becarioId
}

// Público: solo perfiles con mostrar_en_mapa (y sin los campos de estado,
// vía field-access de arriba). Becario: solo su propio registro. Staff,
// directiva y admin: todos — ver la matriz en 01-documento-de-proyecto.md §10.
const lecturaBecarios: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff' || rol === 'directiva') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    return becarioId ? ({ id: { equals: becarioId } } as Where) : false
  }
  return { mostrar_en_mapa: { equals: true } } as Where
}

// El becario solo puede llegar a su propio registro (para editar cita,
// historia, foto, mostrar_en_mapa y su consentimiento — el resto de los
// campos queda bloqueado por field-access). Staff y admin, todos. Directiva
// es de solo lectura, nunca escribe.
const escrituraBecarios: Access = ({ req }) => {
  const rol = rolDe(req.user as User | null)
  if (rol === 'admin' || rol === 'staff') return true
  if (rol === 'becario') {
    const becarioId = idDeRelacion((req.user as User | null)?.becario)
    return becarioId ? ({ id: { equals: becarioId } } as Where) : false
  }
  return false
}

// "Confirmación al reactivarse" (3.4 del plan de ejecución): registra CUÁNDO
// pasó, sin importar si fue el automatismo de Recuperaciones o un cambio
// manual del staff en el panel — ambos casos pasan por acá porque los dos
// terminan en un `update` sobre esta colección. El panel del becario usa esta
// fecha para mostrar un aviso de bienvenida de vuelta por unos días.
const registrarReactivacion: CollectionBeforeChangeHook<Becario> = ({ data, originalDoc, operation }) => {
  if (operation === 'update' && originalDoc?.estado === 'suspendido' && data.estado === 'activo') {
    return { ...data, fecha_reactivacion: new Date().toISOString() }
  }
  return data
}

// La foto es pública en /impacto solo mientras mostrar_en_mapa esté activo
// (ver FotosBecarios.access.read) — este hook mantiene el campo `publica` de
// la foto sincronizado con el consentimiento actual, en vez de dejar que el
// staff tenga que acordarse de tocarlo a mano en dos colecciones distintas.
const sincronizarFotoPublica: CollectionAfterChangeHook<Becario> = async ({ doc, req }) => {
  const fotoId = idDeRelacion(doc.foto)
  if (!fotoId) return doc
  await req.payload.update({
    collection: 'fotos-becarios',
    id: fotoId,
    data: { publica: doc.mostrar_en_mapa === true },
    overrideAccess: true,
    req,
  })
  return doc
}

// Alta de becarios: creada por el staff mediante invitación — no hay
// autorregistro (01-documento-de-proyecto.md §4.6).
export const Becarios: CollectionConfig = {
  slug: 'becarios',
  typescript: { interface: 'Becario' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'universidad', 'estado', 'mostrar_en_mapa'],
  },
  access: {
    read: lecturaBecarios,
    create: esStaffOSuperior,
    update: escrituraBecarios,
    delete: esStaffOSuperior,
  },
  hooks: {
    beforeChange: [registrarReactivacion],
    afterChange: [sincronizarFotoPublica],
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'comunidad',
      type: 'relationship',
      relationTo: 'comunidades',
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'nivel_educativo',
      type: 'select',
      required: true,
      defaultValue: 'universidad',
      options: [
        { label: 'Primaria', value: 'primaria' },
        { label: 'Premedia', value: 'premedia' },
        { label: 'Media', value: 'media' },
        { label: 'Universidad', value: 'universidad' },
      ],
      admin: { description: 'Determina si aplican los campos de universidad/carrera o es un becario de escuela (Becas de Comunidad)' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'tipo_apoyo',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Hospedaje', value: 'hospedaje' },
        { label: 'Transporte', value: 'transporte' },
        { label: 'Alimento', value: 'alimento' },
      ],
      admin: { description: 'Apoyo adicional que recibe además de la beca académica' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'universidad',
      type: 'text',
      admin: { condition: (data) => data?.nivel_educativo === 'universidad' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'carrera',
      type: 'text',
      localized: true,
      admin: { condition: (data) => data?.nivel_educativo === 'universidad' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'anio',
      type: 'number',
      admin: {
        description: 'Año de la carrera que cursa actualmente',
        condition: (data) => data?.nivel_educativo === 'universidad',
      },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'anio_inicio',
      type: 'number',
      admin: { description: 'Año en que inició la beca' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'tipo_estudio',
      type: 'select',
      defaultValue: 'nacional',
      options: [
        { label: 'Nacional', value: 'nacional' },
        { label: 'Internacional', value: 'internacional' },
      ],
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'pais_estudio',
      type: 'text',
      admin: { condition: (data) => data?.tipo_estudio === 'internacional' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'ciudad_estudio',
      type: 'text',
      admin: { condition: (data) => data?.tipo_estudio === 'internacional' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'coordenadas_estudio',
      type: 'group',
      admin: {
        condition: (data) => data?.tipo_estudio === 'internacional',
        description: 'Ubicación de la universidad en el extranjero, para el arco en el Mapa de Impacto',
      },
      access: { update: esStaffOSuperiorFieldAccess },
      fields: [
        { name: 'lat', type: 'number', min: -90, max: 90 },
        { name: 'lng', type: 'number', min: -180, max: 180 },
      ],
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'activo',
      options: [
        { label: 'Activo', value: 'activo' },
        { label: 'Suspendido', value: 'suspendido' },
        { label: 'Graduado', value: 'graduado' },
        { label: 'Retornado', value: 'retornado' },
        { label: 'Retirado', value: 'retirado' },
      ],
      // Nunca lo activa el becario, y nunca es público — ver soloPropioOStaffField.
      access: { read: soloPropioOStaffField, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'motivo_suspension',
      type: 'textarea',
      admin: { description: 'Lo que ve el becario suspendido. Se completa automáticamente al verificar un registro académico con materias reprobadas.' },
      access: { read: soloPropioOStaffField, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'fecha_suspension',
      type: 'date',
      access: { read: soloPropioOStaffField, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'fecha_reactivacion',
      type: 'date',
      admin: { readOnly: true, description: 'Se completa sola cada vez que el becario vuelve a activo desde suspendido — automática o manual' },
      access: { read: soloPropioOStaffField, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'meta_horas_personalizada',
      type: 'number',
      admin: { description: 'Sobrescribe la meta global de Configuracion — solo si esta universidad exige un mínimo distinto' },
      access: { update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'fotos-becarios',
    },
    {
      name: 'cita',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'historia',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'mostrar_en_mapa',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'El becario puede revocar su consentimiento apagando esto en cualquier momento' },
      validate: (value, { siblingData }) => {
        const data = siblingData as { consentimiento_firmado?: boolean }
        if (value && !data?.consentimiento_firmado) {
          return 'No se puede mostrar en el mapa sin consentimiento_firmado'
        }
        return true
      },
    },
    {
      name: 'consentimiento_firmado',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'consentimiento_fecha',
      type: 'date',
      admin: { condition: (data) => !!data?.consentimiento_firmado },
    },
    // Dato sensible del expediente (01-documento-de-proyecto.md §8): la
    // condición socioeconómica es un requisito de elegibilidad, no un campo
    // de perfil — solo se registra que quedó verificada. La documentación de
    // respaldo queda restringida al staff evaluador, ni siquiera la
    // directiva o el propio becario la ven (solo ven que está verificada).
    {
      name: 'condicion_socioeconomica_verificada',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Requisito de elegibilidad — no es un campo de perfil, solo se registra que se verificó' },
      access: { create: esStaffOSuperiorFieldAccess, read: esStaffDirectivaOAdminFieldAccess, update: esStaffOSuperiorFieldAccess },
    },
    {
      name: 'documentacion_socioeconomica',
      type: 'upload',
      relationTo: 'documentos-privados',
      admin: {
        description: 'Documentación de respaldo (ej. recibos de luz, agua, constancia de ingresos)',
      },
      access: {
        read: esStaffDirectivaOAdminFieldAccess,
      },
    },
  ],
}
