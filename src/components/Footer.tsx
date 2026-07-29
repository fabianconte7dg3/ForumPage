import type { Locale } from '@/i18n'

const TEXTOS: Record<Locale, { legal: string; privacidad: string; transparencia: string; copyright: string }> = {
  es: {
    legal: 'Aviso Legal',
    privacidad: 'Privacidad',
    transparencia: 'Transparencia',
    copyright: '© Forum Foundation. Coclé, Panamá.',
  },
  en: {
    legal: 'Legal Notice',
    privacidad: 'Privacy',
    transparencia: 'Transparency',
    copyright: '© Forum Foundation. Coclé, Panama.',
  },
}

export function Footer({ locale }: { locale: Locale }) {
  const t = TEXTOS[locale]
  return (
    <footer className="border-t border-piedra/25 bg-niebla px-4 py-12 md:px-16">
      <div className="mx-auto flex max-w-(--container-content) flex-col justify-between gap-8 md:flex-row">
        <div>
          <p className="font-display text-lg font-bold text-montana">FORUM FOUNDATION</p>
          <p className="mt-2 font-lectura text-sm text-tinta/70">{t.copyright}</p>
        </div>
        <nav className="flex gap-6 font-lectura text-sm text-tinta/70">
          <a className="hover:text-montana" href="#">
            {t.legal}
          </a>
          <a className="hover:text-montana" href="#">
            {t.privacidad}
          </a>
          <a className="hover:text-montana" href="#">
            {t.transparencia}
          </a>
        </nav>
      </div>
    </footer>
  )
}
