'use client'

import dynamic from 'next/dynamic'

const MapaPreviewHome = dynamic(() => import('@/components/MapaPreviewHome').then((m) => m.MapaPreviewHome), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-sm border border-piedra/25 bg-piedra/10 md:col-span-2" />,
})

export function MapaPreviewHomeLoader(props: {
  locale: string
  maptilerKey?: string
  comunidades: { id: number; nombre: string; lat: number; lng: number }[]
}) {
  return <MapaPreviewHome {...props} />
}
