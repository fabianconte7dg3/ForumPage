import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Locale } from '@/i18n'
import type { Actividad, Tutoria } from '@/payload-types'

const TEXTOS = {
  es: {
    recordLabel: 'REGISTRO 001. MISIÓN PRINCIPAL',
    titulo: 'Cambio sostenible en Coclé',
    subtitulo:
      'Documentando la metodología y el impacto verificado de las iniciativas educativas en comunidades rurales de Panamá.',
    becariosActivos: 'BECARIOS ACTIVOS',
    comunidades: 'COMUNIDADES ATENDIDAS',
    paises: 'PAÍSES ALCANZADOS',
    obrasCompletadas: 'OBRAS COMPLETADAS',
    actualizado: (f: string) => `Actualizado ${f}`,
    sinActualizar: 'Sin fecha de actualización registrada',
    mapaTitulo: 'Alcance geográfico',
    mapaTexto: 'Ubicaciones verificadas de intervenciones de infraestructura y programas de becas activos en la región.',
    verMapa: 'Ver mapa completo',
    actividadesTitulo: 'Actividades recientes',
    verTodas: 'Ver todas',
    aprendeLabel: 'ACCESO AL APRENDIZAJE',
    aprendeTitulo: 'Tutorías y biblioteca',
    proximaTutoria: 'PRÓXIMA TUTORÍA PROGRAMADA',
    sinTutorias: 'No hay tutorías programadas por ahora.',
    biblioteca: 'Biblioteca',
    ingresarPortal: 'Ingresar al portal',
    informeLabel: 'DOCUMENTO OFICIAL',
    informeTitulo: 'Informe anual',
    sinInforme: 'Aún no hay informes anuales cargados.',
  },
  en: {
    recordLabel: 'RECORD 001. PRIMARY MISSION',
    titulo: 'Sustainable change in Coclé',
    subtitulo:
      'Documenting the methodology and verified impact of educational initiatives across rural communities in Panama.',
    becariosActivos: 'ACTIVE SCHOLARS',
    comunidades: 'COMMUNITIES SERVED',
    paises: 'COUNTRIES REACHED',
    obrasCompletadas: 'COMPLETED WORKS',
    actualizado: (f: string) => `Updated ${f}`,
    sinActualizar: 'No update date recorded',
    mapaTitulo: 'Geographic footprint',
    mapaTexto: 'Verified locations of infrastructure interventions and active scholarship programs across the region.',
    verMapa: 'View full map',
    actividadesTitulo: 'Recent activities',
    verTodas: 'View all',
    aprendeLabel: 'LEARNING ACCESS',
    aprendeTitulo: 'Tutoring and library',
    proximaTutoria: 'NEXT SCHEDULED TUTORING',
    sinTutorias: 'No tutoring sessions scheduled right now.',
    biblioteca: 'Library',
    ingresarPortal: 'Enter the portal',
    informeLabel: 'OFFICIAL DOCUMENT',
    informeTitulo: 'Annual report',
    sinInforme: 'No annual reports uploaded yet.',
  },
} satisfies Record<Locale, Record<string, unknown>>

const formatearFecha = (valor: string, locale: Locale) =>
  new Date(valor).toLocaleDateString(locale === 'es' ? 'es-PA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale]
  const payload = await getPayload({ config })

  const [comunidades, proyectosCompletados, configuracion, actividades, proximasTutorias] = await Promise.all([
    payload.count({ collection: 'comunidades', overrideAccess: true }),
    payload.count({ collection: 'proyectos', where: { estado: { equals: 'completado' } }, overrideAccess: true }),
    payload.findGlobal({ slug: 'configuracion', overrideAccess: true }),
    payload.find({ collection: 'actividades', sort: '-fecha_publicacion', limit: 3, depth: 1, locale, overrideAccess: true }),
    payload.find({
      collection: 'tutorias',
      where: { fecha_hora: { greater_than_equal: new Date().toISOString() } },
      sort: 'fecha_hora',
      limit: 1,
      depth: 1,
      locale,
      overrideAccess: true,
    }),
  ])

  const proximaTutoria = proximasTutorias.docs[0] as Tutoria | undefined

  return (
    <>
      {/* Hero */}
      <section className="border-b border-piedra/25 bg-niebla px-4 py-24 md:px-16 md:py-32">
        <div className="mx-auto max-w-(--container-content)">
          <p className="font-dato text-xs uppercase tracking-widest text-tinta/60">{t.recordLabel}</p>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase text-montana md:text-6xl">{t.titulo}</h1>
          <p className="mt-6 max-w-2xl font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
        </div>
        <div className="arco-divisor mx-auto mt-16 max-w-(--container-content)" />
      </section>

      {/* Cifras clave */}
      <section className="mx-auto max-w-(--container-content) px-4 py-16 md:px-16">
        <div className="grid grid-cols-2 gap-8 border-b border-piedra/25 pb-8 md:grid-cols-4">
          <Cifra etiqueta={t.becariosActivos} valor="—" />
          <Cifra etiqueta={t.comunidades} valor={String(comunidades.totalDocs)} />
          <Cifra etiqueta={t.paises} valor="—" />
          <Cifra etiqueta={t.obrasCompletadas} valor={String(proyectosCompletados.totalDocs)} />
        </div>
        <p className="mt-4 font-dato text-xs text-tinta/50">
          {configuracion.fecha_actualizacion_impacto
            ? t.actualizado(formatearFecha(configuracion.fecha_actualizacion_impacto, locale))
            : t.sinActualizar}
        </p>
      </section>

      {/* Mapa reducido */}
      <section className="border-y border-piedra/25 bg-niebla px-4 py-16 md:px-16">
        <div className="mx-auto grid max-w-(--container-content) items-center gap-8 md:grid-cols-3">
          <div>
            <h2 className="font-display text-xl font-bold uppercase text-montana">{t.mapaTitulo}</h2>
            <p className="mt-4 font-lectura text-sm text-tinta/70">{t.mapaTexto}</p>
            <Link
              className="mt-6 inline-block rounded-md bg-montana px-6 py-3 font-dato text-xs uppercase tracking-wider text-niebla hover:bg-montana-hover"
              href={`/${locale}/impacto`}
            >
              {t.verMapa}
            </Link>
          </div>
          <div className="flex h-64 items-center justify-center border border-piedra/25 bg-white md:col-span-2">
            <span className="font-dato text-xs uppercase tracking-widest text-piedra">Mapa de Impacto</span>
          </div>
        </div>
      </section>

      {/* Actividades recientes */}
      <section className="mx-auto max-w-(--container-content) px-4 py-16 md:px-16">
        <div className="mb-8 flex items-end justify-between border-b border-piedra/25 pb-4">
          <h2 className="font-display text-xl font-bold uppercase text-montana">{t.actividadesTitulo}</h2>
          <Link className="font-dato text-xs uppercase text-tinta hover:text-montana" href={`/${locale}/historias`}>
            {t.verTodas} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {actividades.docs.map((actividad) => (
            <ActividadCard actividad={actividad as Actividad} locale={locale} key={actividad.id} />
          ))}
        </div>
      </section>

      {/* Aprende + Informe anual */}
      <section className="grid grid-cols-1 border-t border-piedra/25 md:grid-cols-2">
        <div className="flex flex-col justify-center border-piedra/25 p-8 md:border-r md:p-16">
          <p className="font-dato text-xs uppercase tracking-widest text-tinta/60">{t.aprendeLabel}</p>
          <h2 className="mt-4 font-display text-xl font-bold uppercase text-montana">{t.aprendeTitulo}</h2>
          <div className="relative mt-8 border border-piedra/25 bg-niebla p-6">
            <div className="absolute inset-y-0 left-0 w-1 bg-cosecha" />
            {proximaTutoria ? (
              <>
                <p className="font-dato text-xs text-tinta">{t.proximaTutoria}</p>
                <p className="mt-2 font-lectura text-base text-montana">
                  {typeof proximaTutoria.materia === 'object' ? proximaTutoria.materia?.nombre : ''}
                  {typeof proximaTutoria.sede === 'object' && proximaTutoria.sede ? ` — ${proximaTutoria.sede.nombre}` : ''}
                </p>
                <p className="mt-2 font-dato text-xs text-tinta/60">{formatearFecha(proximaTutoria.fecha_hora, locale)}</p>
              </>
            ) : (
              <p className="font-lectura text-sm text-tinta/70">{t.sinTutorias}</p>
            )}
          </div>
          <div className="mt-8 flex gap-4">
            <Link
              className="flex-1 rounded-md border border-piedra/25 px-6 py-3 text-center font-dato text-xs uppercase tracking-wider text-tinta hover:bg-white"
              href={`/${locale}/aprende/biblioteca`}
            >
              {t.biblioteca}
            </Link>
            <Link
              className="flex-1 rounded-md bg-montana px-6 py-3 text-center font-dato text-xs uppercase tracking-wider text-niebla hover:bg-montana-hover"
              href={`/${locale}/portal`}
            >
              {t.ingresarPortal}
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-start justify-center bg-niebla p-8 md:p-16">
          <p className="font-dato text-xs uppercase tracking-widest text-tinta/60">{t.informeLabel}</p>
          <h2 className="mt-4 font-display text-xl font-bold uppercase text-montana">{t.informeTitulo}</h2>
          <p className="mt-4 font-lectura text-sm text-tinta/70">{t.sinInforme}</p>
        </div>
      </section>
    </>
  )
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="border-l border-piedra/25 pl-4">
      <p className="font-dato text-xs uppercase text-tinta/60">{etiqueta}</p>
      <p className="mt-2 font-dato text-3xl font-light text-montana">{valor}</p>
    </div>
  )
}

function ActividadCard({ actividad, locale }: { actividad: Actividad; locale: Locale }) {
  const comunidad = typeof actividad.comunidad === 'object' ? actividad.comunidad : undefined
  const programa = typeof actividad.programa === 'object' ? actividad.programa : undefined
  const portada = typeof actividad.portada === 'object' ? actividad.portada : undefined

  return (
    <Link
      className="group flex flex-col border border-piedra/25 transition-colors hover:bg-niebla"
      href={`/${locale}/historias/${actividad.slug}`}
    >
      <div className="aspect-4/3 border-b border-piedra/25 bg-niebla">
        {portada?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={portada.alt ?? ''} className="h-full w-full object-cover" src={portada.url} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-piedra/40">FORUM</div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="font-dato text-xs text-tinta/60">{formatearFecha(actividad.fecha_publicacion, locale)}</span>
          <div className="flex gap-2">
            {comunidad && (
              <span className="rounded-sm border border-piedra/25 px-2 py-0.5 font-dato text-[10px] uppercase text-tinta">
                {comunidad.nombre}
              </span>
            )}
            {programa && (
              <span className="rounded-sm border border-piedra/25 px-2 py-0.5 font-dato text-[10px] uppercase text-tinta">
                {programa.nombre}
              </span>
            )}
          </div>
        </div>
        <h3 className="font-display text-base font-bold uppercase leading-tight text-montana">{actividad.titulo}</h3>
      </div>
    </Link>
  )
}
