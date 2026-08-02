'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = {
  es: [
    { id: 'becarios', label: 'Becarios' },
    { id: 'publicaciones', label: 'Publicaciones' },
    { id: 'comunidades', label: 'Comunidades (Mapa)' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'equipo', label: 'Nosotros / Equipo' },
  ],
  en: [
    { id: 'becarios', label: 'Becarios' },
    { id: 'publicaciones', label: 'Publications' },
    { id: 'comunidades', label: 'Communities (Map)' },
    { id: 'proyectos', label: 'Projects' },
    { id: 'equipo', label: 'About / Team' },
  ],
} as const

export function NavegacionStaff({ locale }: { locale: 'es' | 'en' }) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') ?? 'becarios'
  const tabs = TABS[locale]

  return (
    <nav className="mb-8 overflow-x-auto border-b border-piedra/25">
      <ul className="flex min-w-max space-x-6">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <li key={tab.id}>
              <Link
                href={`/${locale}/staff?tab=${tab.id}`}
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
