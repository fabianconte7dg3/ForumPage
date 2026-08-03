'use client'

import { useState } from 'react'

import { ImpactoOverview } from './ImpactoOverview'

export function ImpactoTabs({
  mapaComponent,
  overviewProps,
  textos,
}: {
  mapaComponent: React.ReactNode
  overviewProps: Omit<React.ComponentProps<typeof ImpactoOverview>, 'onClickAbrirMapa'>
  textos: { map: string; overview: string }
}) {
  const [activeTab, setActiveTab] = useState<'map' | 'overview'>('overview')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div></div>
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
        </div>
      </div>

      <div>
        {activeTab === 'map' ? mapaComponent : <ImpactoOverview {...overviewProps} onClickAbrirMapa={() => setActiveTab('map')} />}
      </div>
    </div>
  )
}
