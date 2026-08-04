import { redirect } from 'next/navigation'

import { FormularioDosFA } from '@/components/FormularioDosFA'
import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Seguridad de mi cuenta',
    descripcion: 'Verificación en dos pasos con una app autenticadora (Google Authenticator, Authy, etc.) — un segundo código además de tu contraseña.',
  },
  en: {
    titulo: 'Account security',
    descripcion: 'Two-step verification with an authenticator app (Google Authenticator, Authy, etc.) — a second code in addition to your password.',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function SeguridadCuentaPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario) {
    redirect(`/${locale}/portal`)
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-2xl font-bold uppercase text-montana md:text-3xl">{t.titulo}</h1>
        <p className="mt-2 max-w-(--text-reading-width) font-lectura text-sm text-tinta/80">{t.descripcion}</p>
      </header>

      <FormularioDosFA dosFAHabilitado={usuario.dosFA_habilitado ?? false} locale={locale} />
    </div>
  )
}
