import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { BotonCerrarSesion } from '@/components/BotonCerrarSesion'
import { TablaBecarios } from '@/components/staff/TablaBecarios'
import { NavegacionStaff } from '@/components/staff/NavegacionStaff'
import { TabPublicaciones } from '@/components/staff/TabPublicaciones'
import { TabComunidades } from '@/components/staff/TabComunidades'
import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Becario, HoraLaborSocial, Actividad, Comunidad } from '@/payload-types'

export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Panel del Staff',
    subtitulo: 'Gestión de expedientes de becarios',
    cerrarSesion: 'Cerrar sesión',
    columnasBecario: 'Becario',
    columnasUniversidad: 'Universidad',
    columnasEstado: 'Estado de beca',
    columnasPendientes: 'Pendientes',
    columnasProgreso: 'Progreso',
    columnasAccion: '',
    verExpediente: 'Ver expediente',
    sinBecarios: 'No hay becarios registrados.',
    estadoActivo: 'Activo',
    estadoSuspendido: 'Suspendido',
    estadoGraduado: 'Graduado',
    estadoRetornado: 'Retornado',
    estadoRetirado: 'Retirado',
    totalBecarios: 'Becarios',
    totalPendientes: 'Horas pendientes de revisión',
    totalAprobadas: 'Horas aprobadas este ciclo',
    buscarPlaceholder: 'Buscar por nombre...',
    sinResultados: 'No se encontraron becarios.',
  },
  en: {
    titulo: 'Staff Panel',
    subtitulo: 'Becario expedition management',
    cerrarSesion: 'Log out',
    columnasBecario: 'Becario',
    columnasUniversidad: 'University',
    columnasEstado: 'Scholarship status',
    columnasPendientes: 'Pending',
    columnasProgreso: 'Progress',
    columnasAccion: '',
    verExpediente: 'View record',
    sinBecarios: 'No becarios registered.',
    estadoActivo: 'Active',
    estadoSuspendido: 'Suspended',
    estadoGraduado: 'Graduated',
    estadoRetornado: 'Returned',
    estadoRetirado: 'Withdrawn',
    totalBecarios: 'Becarios',
    totalPendientes: 'Hours pending review',
    totalAprobadas: 'Approved hours this cycle',
    buscarPlaceholder: 'Search by name...',
    sinResultados: 'No becarios found.',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function StaffDashboardPage({
  params,
  searchParams 
}: { 
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ tab?: string; p?: string }> 
}) {
  const { locale } = await params
  const { tab = 'becarios', p = '1' } = await searchParams
  const paginaPublicaciones = Math.max(1, parseInt(p, 10) || 1)
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    redirect(`/${locale}/portal`)
  }

  const payload = await getPayload({ config })

  // Comunidades simples para el selector del formulario
  const comunidadesDocs = (
    await payload.find({
      collection: 'comunidades',
      limit: 200,
      sort: 'nombre',
      overrideAccess: true,
    })
  ).docs
  const comunidades = comunidadesDocs.map((c) => ({ id: c.id, nombre: c.nombre }))

  // Todos los becarios
  const becarios = (
    await payload.find({
      collection: 'becarios',
      limit: 500,
      sort: 'nombre',
      overrideAccess: true,
    })
  ).docs as Becario[]

  // Todas las horas (para calcular pendientes y aprobadas por becario)
  const todasLasHoras = (
    await payload.find({
      collection: 'horas-labor-social',
      limit: 10000,
      overrideAccess: true,
    })
  ).docs as HoraLaborSocial[]

  // Agrupar horas por becario
  const horasPorBecario = new Map<number, { pendientes: number; aprobadas: number }>()
  for (const h of todasLasHoras) {
    const bId = typeof h.becario === 'object' ? h.becario.id : h.becario
    const entry = horasPorBecario.get(bId) ?? { pendientes: 0, aprobadas: 0 }
    if (h.estado === 'pendiente') entry.pendientes += h.horas
    if (h.estado === 'aprobada') entry.aprobadas += h.horas
    horasPorBecario.set(bId, entry)
  }

  const totalPendientes = todasLasHoras.filter((h) => h.estado === 'pendiente').reduce((acc, h) => acc + h.horas, 0)
  const totalAprobadas = todasLasHoras.filter((h) => h.estado === 'aprobada').reduce((acc, h) => acc + h.horas, 0)

  // Publicaciones (Actividades) paginadas
  const publicacionesResponse = await payload.find({
    collection: 'actividades',
    limit: 10,
    page: paginaPublicaciones,
    sort: '-fecha_publicacion',
    overrideAccess: true,
  })
  const publicaciones = publicacionesResponse.docs as Actividad[]

  // Map is not serializable for Client Components, converting to object
  const horasObj: Record<number, { pendientes: number; aprobadas: number }> = {}
  horasPorBecario.forEach((value, key) => {
    horasObj[key] = value
  })

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-piedra/25 pb-8">
        <div>
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">Forum Foundation</p>
          <h1 className="font-display text-2xl font-bold uppercase text-montana md:text-3xl">{t.titulo}</h1>
          <p className="mt-1 font-lectura text-sm text-tinta/70">{t.subtitulo}</p>
        </div>
        <BotonCerrarSesion locale={locale} texto={t.cerrarSesion} />
      </header>

      <NavegacionStaff locale={locale} />

      {tab === 'becarios' && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
              <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalBecarios}</p>
              <p className="mt-1 font-display text-2xl font-bold text-tinta">{becarios.length}</p>
            </div>
            <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
              <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalPendientes}</p>
              <p className="mt-1 font-display text-2xl font-bold text-cosecha">{totalPendientes}</p>
            </div>
            <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
              <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalAprobadas}</p>
              <p className="mt-1 font-display text-2xl font-bold text-montana">{totalAprobadas}</p>
            </div>
          </div>

          <TablaBecarios 
            locale={locale} 
            becarios={becarios} 
            horasPorBecario={horasObj} 
            comunidades={comunidades}
            textos={t} 
          />
        </>
      )}

      {tab === 'publicaciones' && (
        <TabPublicaciones 
          locale={locale} 
          publicaciones={publicaciones}
          page={publicacionesResponse.page}
          totalPages={publicacionesResponse.totalPages}
          hasNextPage={publicacionesResponse.hasNextPage}
          hasPrevPage={publicacionesResponse.hasPrevPage}
        />
      )}

      {tab === 'comunidades' && (
        <TabComunidades 
          locale={locale} 
          comunidades={comunidadesDocs as Comunidad[]} 
        />
      )}
    </div>
  )
}
