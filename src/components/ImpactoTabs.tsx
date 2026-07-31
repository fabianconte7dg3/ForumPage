'use client'

import { useState } from 'react'
import Link from 'next/link'

export function ImpactoTabs({
  mapaComponent,
  overviewComponent,
  textos,
  locale,
}: {
  mapaComponent: React.ReactNode
  overviewComponent: (abrirMapa: () => void) => React.ReactNode
  textos: { map: string; overview: string; teamPortal: string }
  locale: string
}) {
  const [activeTab, setActiveTab] = useState<'map' | 'overview'>('overview')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          {/* We assume the site layout already has the logo, so we just put the page title here or leave it empty if the layout handles it. The design has "FF Forum Foundation..." but we can just use the tabs on the right. */}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-piedra/10 p-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`rounded-full px-4 py-1.5 font-dato text-xs uppercase tracking-wider transition-colors ${
              activeTab === 'map' ? 'bg-cosecha text-niebla' : 'text-tinta hover:bg-piedra/20'
            }`}
          >
            {textos.map}
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-full px-4 py-1.5 font-dato text-xs uppercase tracking-wider transition-colors ${
              activeTab === 'overview' ? 'bg-cosecha text-niebla' : 'text-tinta hover:bg-piedra/20'
            }`}
          >
            {textos.overview}
          </button>
          <Link
            href={`/${locale}/portal`}
            className="rounded-full px-4 py-1.5 font-dato text-xs uppercase tracking-wider text-tinta transition-colors hover:bg-piedra/20"
          >
            {textos.teamPortal}
          </Link>
        </div>
      </div>

      <div>
        {activeTab === 'map' ? mapaComponent : overviewComponent(() => setActiveTab('map'))}
      </div>
    </div>
  )
}
