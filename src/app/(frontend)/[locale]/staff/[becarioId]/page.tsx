import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Becario } from '@/payload-types'

import { NavegacionExpediente } from '@/components/staff/NavegacionExpediente'
import { TabLaborSocial } from '@/components/staff/TabLaborSocial'
import { TabAcademico } from '@/components/staff/TabAcademico'
import { TabDesembolsos } from '@/components/staff/TabDesembolsos'
import { TabPrivado } from '@/components/staff/TabPrivado'

export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    volver: '← Volver al panel',
    subtitulo: 'Expediente del Becario',
    universidad: 'Universidad',
    carrera: 'Carrera',
    anio: 'Año',
    estadoBeca: 'Estado beca',
    estadoActivo: 'Activo',
    estadoSuspendido: 'Suspendido',
    estadoGraduado: 'Graduado',
    estadoRetornado: 'Retornado',
    estadoRetirado: 'Retirado',
  },
  en: {
    volver: '← Back to panel',
    subtitulo: 'Becario Record',
    universidad: 'University',
    carrera: 'Major',
    anio: 'Year',
    estadoBeca: 'Scholarship',
    estadoActivo: 'Active',
    estadoSuspendido: 'Suspended',
    estadoGraduado: 'Graduated',
    estadoRetornado: 'Returned',
    estadoRetirado: 'Withdrawn',
  },
} as const

export default async function ExpedienteBecarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; becarioId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { locale, becarioId } = await params
  const { tab = 'labor-social' } = await searchParams
  
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    redirect(`/${locale}/portal`)
  }

  const payload = await getPayload({ config })
  const id = Number(becarioId)
  if (Number.isNaN(id)) notFound()

  let becario: Becario
  try {
    becario = await payload.findByID({ collection: 'becarios', id, overrideAccess: true }) as Becario
  } catch {
    notFound()
  }

  const ESTADO_BECA_LABEL = {
    activo: t.estadoActivo,
    suspendido: t.estadoSuspendido,
    graduado: t.estadoGraduado,
    retornado: t.estadoRetornado,
    retirado: t.estadoRetirado,
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      {/* Navegación de regreso */}
      <Link
        className="mb-6 inline-block font-dato text-xs uppercase tracking-widest text-piedra transition-colors hover:text-montana"
        href={`/${locale}/staff`}
      >
        {t.volver}
      </Link>

      {/* Header Fijo */}
      <header className="mb-8 border-b border-piedra/25 pb-6">
        <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.subtitulo}</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase text-tinta md:text-3xl">{becario.nombre}</h1>
        
        <div className="mt-2 flex flex-wrap gap-4 font-dato text-xs text-piedra">
          {becario.universidad && (
            <span><span className="uppercase tracking-widest">{t.universidad}:</span> {becario.universidad}</span>
          )}
          {becario.carrera && (
            <span><span className="uppercase tracking-widest">{t.carrera}:</span> {becario.carrera}</span>
          )}
          {becario.anio && (
            <span><span className="uppercase tracking-widest">{t.anio}:</span> {becario.anio}°</span>
          )}
          <span>
            <span className="uppercase tracking-widest">{t.estadoBeca}:</span>{' '}
            <span className={becario.estado === 'activo' ? 'text-montana' : 'text-cosecha'}>
              {ESTADO_BECA_LABEL[becario.estado]}
            </span>
          </span>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <NavegacionExpediente locale={locale} becarioId={id} />

      {/* Contenido de la pestaña */}
      {tab === 'labor-social' && <TabLaborSocial becario={becario} locale={locale} />}
      
      {tab === 'academico' && <TabAcademico becario={becario} locale={locale} />}
      
      {tab === 'finanzas' && <TabDesembolsos becario={becario} locale={locale} />}
      
      {tab === 'privado' && <TabPrivado becario={becario} locale={locale} />}
    </div>
  )
}
