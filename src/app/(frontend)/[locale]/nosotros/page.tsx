import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Equipo, Media } from '@/payload-types'

// El contenido de esta página (misión, historia, equipo) lo edita el staff
// desde el panel — nunca estático en el código.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Nosotros',
    historiaTitulo: 'Nuestra historia',
    equipoTitulo: 'Nuestro equipo',
  },
  en: {
    titulo: 'About Us',
    historiaTitulo: 'Our history',
    equipoTitulo: 'Our team',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function NosotrosPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const [nosotros, equipo] = await Promise.all([
    payload.findGlobal({ slug: 'nosotros', locale, depth: 1, overrideAccess: true }),
    payload.find({ collection: 'equipo', sort: 'orden', limit: 50, locale, depth: 1, overrideAccess: true }),
  ])
  const fotoNosotros = typeof nosotros.foto === 'object' ? (nosotros.foto as Media) : undefined
  const logoNosotros = typeof nosotros.logo === 'object' ? (nosotros.logo as Media) : undefined

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
      </header>

      {(nosotros.mision || nosotros.historia) && (
        <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            {nosotros.mision && (
              <div className="mb-12 max-w-(--text-reading-width) font-lectura text-base leading-relaxed text-tinta [&>p]:mb-4">
                <RichText data={nosotros.mision} />
              </div>
            )}
            {nosotros.historia && (
              <section>
                <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.historiaTitulo}</h2>
                <div className="max-w-(--text-reading-width) font-lectura text-base leading-relaxed text-tinta [&>p]:mb-4">
                  <RichText data={nosotros.historia} />
                </div>
              </section>
            )}
          </div>

          {(fotoNosotros?.url || logoNosotros?.url) && (
            <div className="space-y-4 lg:sticky lg:top-24">
              {fotoNosotros?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={fotoNosotros.alt ?? ''} className="aspect-4/3 w-full rounded-md object-cover" src={fotoNosotros.url} />
              )}
              {logoNosotros?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={logoNosotros.alt ?? ''} className="mx-auto w-40 object-contain" src={logoNosotros.url} />
              )}
            </div>
          )}
        </div>
      )}

      {equipo.docs.length > 0 && (
        <section>
          <h2 className="mb-6 font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.equipoTitulo}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {equipo.docs.map((miembro: Equipo) => {
              const foto = typeof miembro.foto === 'object' ? (miembro.foto as Media) : undefined
              return (
                <div className={`rounded-md border border-piedra/25 bg-white p-5 ${miembro.destacado ? 'sm:col-span-2 lg:col-span-3 sm:flex sm:gap-6' : ''}`} key={miembro.id}>
                  {foto?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={foto.alt ?? ''}
                      className={`mb-4 aspect-square w-full rounded-sm object-cover sm:mb-0 ${miembro.destacado ? 'sm:w-48 sm:shrink-0' : 'sm:w-32'}`}
                      src={foto.url}
                    />
                  )}
                  <div>
                    <p className="font-display text-lg font-bold text-tinta">{miembro.nombre}</p>
                    <p className="mb-2 font-dato text-xs uppercase tracking-widest text-montana">{miembro.cargo}</p>
                    {miembro.bio && <p className="font-lectura text-sm leading-relaxed text-tinta/80">{miembro.bio}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
