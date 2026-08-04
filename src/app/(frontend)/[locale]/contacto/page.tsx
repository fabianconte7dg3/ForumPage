import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'

// Datos de contacto: Configuracion.contacto_institucional, editado por el
// staff desde /staff → Configuración general — nunca estático en el código.
// Solo se lee y se renderiza ese subcampo, nunca el resto del global (que
// tiene umbrales internos de solo-staff) — ver docs/spec.md#control-de-acceso-iam.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Contacto',
    subtitulo: 'Escribinos o visitá la fundación en Coclé norte.',
    email: 'Correo',
    telefono: 'Teléfono',
    direccion: 'Dirección',
    sinDatos: 'Los datos de contacto todavía no están cargados — volvé a intentarlo más tarde.',
  },
  en: {
    titulo: 'Contact',
    subtitulo: 'Write to us or visit the foundation in northern Coclé.',
    email: 'Email',
    telefono: 'Phone',
    direccion: 'Address',
    sinDatos: 'Contact details are not loaded yet — please check back later.',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function ContactoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const configuracion = await payload.findGlobal({ slug: 'configuracion', locale, overrideAccess: true })
  const { email, telefono, direccion } = configuracion.contacto_institucional ?? {}
  const hayDatos = Boolean(email || telefono || direccion)

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      {!hayDatos ? (
        <p className="font-lectura text-sm text-tinta/70">{t.sinDatos}</p>
      ) : (
        <dl className="max-w-md space-y-6">
          {email && (
            <div>
              <dt className="mb-1 font-dato text-xs uppercase tracking-widest text-tinta/50">{t.email}</dt>
              <dd>
                <a className="font-lectura text-base text-montana underline-offset-4 hover:underline" href={`mailto:${email}`}>
                  {email}
                </a>
              </dd>
            </div>
          )}
          {telefono && (
            <div>
              <dt className="mb-1 font-dato text-xs uppercase tracking-widest text-tinta/50">{t.telefono}</dt>
              <dd>
                <a className="font-lectura text-base text-montana underline-offset-4 hover:underline" href={`tel:${telefono}`}>
                  {telefono}
                </a>
              </dd>
            </div>
          )}
          {direccion && (
            <div>
              <dt className="mb-1 font-dato text-xs uppercase tracking-widest text-tinta/50">{t.direccion}</dt>
              <dd className="font-lectura text-base text-tinta">{direccion}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  )
}
