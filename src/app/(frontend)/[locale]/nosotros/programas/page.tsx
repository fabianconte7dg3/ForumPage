import Link from 'next/link'
import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Media, Programa, Proyecto } from '@/payload-types'

// El contenido (nombre, descripción, color) lo edita el staff desde
// /staff → Proyectos → Programas — nunca estático en el código.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Programas',
    subtitulo: 'Las líneas de trabajo activas de la fundación en Coclé norte.',
    volver: '← Nosotros',
    sinPrograms: 'Todavía no hay programas registrados.',
    sinProyectos: 'Sin proyectos aún',
    proyectosActivos: (n: number) => `${n} proyecto${n === 1 ? '' : 's'} activo${n === 1 ? '' : 's'}`,
    proyectosCompletados: (n: number) => `${n} completado${n === 1 ? '' : 's'}`,
    verMapa: 'Ver en el Mapa de Impacto →',
  },
  en: {
    titulo: 'Programs',
    subtitulo: "The foundation's active lines of work in northern Coclé.",
    volver: '← About Us',
    sinPrograms: 'No programs registered yet.',
    sinProyectos: 'No projects yet',
    proyectosActivos: (n: number) => `${n} active project${n === 1 ? '' : 's'}`,
    proyectosCompletados: (n: number) => `${n} completed`,
    verMapa: 'View on the Impact Map →',
  },
} satisfies Record<Locale, Record<string, unknown>>

export default async function ProgramasPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const [programas, proyectos, nosotros] = await Promise.all([
    payload.find({ collection: 'programas', where: { activo: { equals: true } }, sort: 'nombre', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'proyectos', limit: 500, depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'nosotros', locale, depth: 1, overrideAccess: true }),
  ])

  const conteoPorPrograma = new Map<number, { activos: number; completados: number }>()
  for (const p of proyectos.docs as Proyecto[]) {
    const programaId = typeof p.programa === 'object' ? p.programa?.id : p.programa
    if (!programaId) continue
    const conteo = conteoPorPrograma.get(programaId) ?? { activos: 0, completados: 0 }
    if (p.estado === 'en_ejecucion' || p.estado === 'aprobado') conteo.activos += 1
    else if (p.estado === 'completado') conteo.completados += 1
    conteoPorPrograma.set(programaId, conteo)
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <Link className="mb-6 inline-block font-dato text-xs font-bold uppercase tracking-widest text-montana" href={`/${locale}/nosotros`}>
        {t.volver}
      </Link>
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      {nosotros.secciones_resumen && nosotros.secciones_resumen.length > 0 && (
        <div className="mb-16 space-y-12">
          {nosotros.secciones_resumen.map((seccion, i) => {
            const imagen = typeof seccion.imagen === 'object' ? (seccion.imagen as Media) : undefined
            return (
              <div
                className={`grid grid-cols-1 items-center gap-6 ${imagen?.url ? 'md:grid-cols-2' : ''}`}
                key={seccion.id ?? i}
              >
                {imagen?.url && (
                  <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={imagen.alt ?? ''}
                      className="aspect-4/3 w-full rounded-md object-cover"
                      src={imagen.url}
                    />
                  </div>
                )}
                <div className={imagen?.url && i % 2 === 1 ? 'md:order-1' : ''}>
                  <h2 className="mb-3 font-display text-xl font-bold uppercase text-montana">{seccion.titulo}</h2>
                  <p className="font-lectura text-base leading-relaxed text-tinta/80">{seccion.texto}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {programas.docs.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.sinPrograms}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {(programas.docs as Programa[]).map((programa) => {
            const conteo = conteoPorPrograma.get(programa.id)
            return (
              <div className="rounded-md border border-piedra/25 bg-white p-6" key={programa.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: programa.color }} />
                  <h2 className="font-display text-lg font-bold text-tinta">{programa.nombre}</h2>
                </div>
                {programa.descripcion && <p className="mb-4 font-lectura text-sm leading-relaxed text-tinta/80">{programa.descripcion}</p>}
                <p className="font-dato text-xs uppercase tracking-widest text-tinta/50">
                  {conteo ? [conteo.activos > 0 ? t.proyectosActivos(conteo.activos) : null, conteo.completados > 0 ? t.proyectosCompletados(conteo.completados) : null].filter(Boolean).join(' · ') || t.sinProyectos : t.sinProyectos}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <Link className="mt-12 inline-block font-display text-sm font-bold uppercase tracking-widest text-montana" href={`/${locale}/impacto`}>
        {t.verMapa}
      </Link>
    </div>
  )
}
