'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = {
  es: [
    { id: 'labor-social', label: 'Labor Social' },
    { id: 'academico', label: 'Académico' },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'privado', label: 'Privado & Admin' },
  ],
  en: [
    { id: 'labor-social', label: 'Social Work' },
    { id: 'academico', label: 'Academic' },
    { id: 'finanzas', label: 'Finances' },
    { id: 'privado', label: 'Private & Admin' },
  ],
} as const

export function NavegacionExpediente({ locale, becarioId }: { locale: 'es' | 'en'; becarioId: number }) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') ?? 'labor-social'
  const tabs = TABS[locale]

  return (
    <nav className="mb-8 overflow-x-auto border-b border-piedra/25">
      <ul className="flex min-w-max space-x-6">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <li key={tab.id}>
              <Link
                href={`/${locale}/staff/${becarioId}?tab=${tab.id}`}
                className={`inline-block pb-3 font-display text-sm font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'border-b-2 border-montana text-montana'
                    : 'border-b-2 border-transparent text-piedra hover:border-piedra hover:text-tinta'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
