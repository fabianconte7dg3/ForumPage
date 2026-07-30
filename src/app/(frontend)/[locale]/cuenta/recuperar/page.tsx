import { SolicitarRecuperacion } from '@/components/SolicitarRecuperacion'
import { defaultLocale, type Locale } from '@/i18n'

const TEXTOS = {
  es: {
    titulo: 'Recuperar contraseña',
    descripcion: 'Ingresá tu correo y te mandamos un enlace para elegir una contraseña nueva.',
  },
  en: {
    titulo: 'Recover password',
    descripcion: "Enter your email and we'll send you a link to choose a new password.",
  },
} satisfies Record<Locale, Record<string, string>>

export default async function RecuperarPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-sm text-tinta/80">{t.descripcion}</p>
      </header>
      <SolicitarRecuperacion locale={locale} />
    </div>
  )
}
