import { FormularioContrasena } from '@/components/FormularioContrasena'
import { defaultLocale, type Locale } from '@/i18n'

const TEXTOS = {
  es: {
    titulo: 'Elegir nueva contraseña',
    descripcion: 'Este enlace es de un solo uso y vence en 1 hora.',
    sinToken: 'Este enlace no es válido o ya venció. Pedí uno nuevo desde "Recuperar contraseña".',
    enviar: 'Restablecer contraseña',
  },
  en: {
    titulo: 'Choose a new password',
    descripcion: 'This link is single-use and expires in 1 hour.',
    sinToken: 'This link is not valid or already expired. Request a new one from "Recover password".',
    enviar: 'Reset password',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function RestablecerPage({
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
        <FormularioContrasena enviarLabel={t.enviar} locale={locale} token={token} />
      ) : (
        <p className="font-lectura text-sm text-red-700">{t.sinToken}</p>
      )}
    </div>
  )
}
