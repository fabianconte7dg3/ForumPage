import { ActivarCuenta } from '@/components/ActivarCuenta'
import { defaultLocale, type Locale } from '@/i18n'

const TEXTOS = {
  es: {
    titulo: 'Activar tu cuenta',
    descripcion: 'Elegí una contraseña para activar tu cuenta de Forum Foundation.',
    sinToken: 'Este enlace no es válido. Pedile al staff que te envíe uno nuevo.',
  },
  en: {
    titulo: 'Activate your account',
    descripcion: 'Choose a password to activate your Forum Foundation account.',
    sinToken: 'This link is not valid. Ask staff to send you a new one.',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function ActivarCuentaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ token?: string }>
}) {
  const { locale } = await params
  const { token } = await searchParams
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-sm text-tinta/80">{t.descripcion}</p>
      </header>
      {token ? (
        <ActivarCuenta locale={locale} token={token} />
      ) : (
        <p className="font-lectura text-sm text-red-700">{t.sinToken}</p>
      )}
    </div>
  )
}
