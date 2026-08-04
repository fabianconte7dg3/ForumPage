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
    { id: 'aprendizaje', label: 'Centro de Aprendizaje' },
  ],
  en: [
    { id: 'becarios', label: 'Becarios' },
    { id: 'publicaciones', label: 'Publications' },
    { id: 'comunidades', label: 'Communities (Map)' },
    { id: 'proyectos', label: 'Projects' },
    { id: 'equipo', label: 'About / Team' },
    { id: 'aprendizaje', label: 'Learning Center' },
  ],
} as const

export function NavegacionStaff({ locale }: { locale: 'es' | 'en' }) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') ?? 'becarios'
  const tabs = TABS[locale]

  return (
    <nav className="overflow-x-auto border-b border-piedra/25 md:overflow-visible md:border-b-0">
      <ul className="flex min-w-max space-x-6 md:min-w-0 md:flex-col md:space-x-0 md:space-y-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <li key={tab.id}>
              <Link
                href={`/${locale}/staff?tab=${tab.id}`}
                className={`block whitespace-nowrap border-b-2 pb-3 font-display text-sm font-bold uppercase tracking-widest transition-colors md:border-b-0 md:border-l-2 md:px-4 md:py-2 md:pb-2 ${
                  isActive
                    ? 'border-montana text-montana md:bg-montana/10'
                    : 'border-transparent text-piedra hover:border-piedra hover:text-tinta md:hover:bg-niebla'
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
