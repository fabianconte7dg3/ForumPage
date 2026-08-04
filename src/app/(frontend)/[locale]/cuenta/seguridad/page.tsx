import { redirect } from 'next/navigation'

import { FormularioCambiarPassword } from '@/components/FormularioCambiarPassword'
import { FormularioDosFA } from '@/components/FormularioDosFA'
import { PanelSesiones } from '@/components/PanelSesiones'
import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Seguridad de mi cuenta',
    descripcion: 'Contraseña, verificación en dos pasos y sesiones activas.',
    descripcion2FA: 'Verificación en dos pasos con una app autenticadora (Google Authenticator, Authy, etc.) — un segundo código además de tu contraseña.',
  },
  en: {
    titulo: 'Account security',
    descripcion: 'Password, two-step verification, and active sessions.',
    descripcion2FA: 'Two-step verification with an authenticator app (Google Authenticator, Authy, etc.) — a second code in addition to your password.',
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

      <div className="flex flex-col gap-8">
        <FormularioCambiarPassword locale={locale} />

        <div>
          <p className="mb-3 max-w-(--text-reading-width) font-lectura text-xs text-tinta/60">{t.descripcion2FA}</p>
          <FormularioDosFA dosFAHabilitado={usuario.dosFA_habilitado ?? false} locale={locale} />
        </div>

        <PanelSesiones locale={locale} sesionesActivas={usuario.sessions?.length ?? 0} ultimoAcceso={usuario.ultimo_acceso} />
      </div>
    </div>
  )
}
