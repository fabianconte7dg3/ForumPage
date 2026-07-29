'use client'

import dynamic from 'next/dynamic'

import type { ComunidadFeature, SedeFeature, Textos } from '@/components/ImpactoMap'

const ImpactoMap = dynamic(() => import('@/components/ImpactoMap').then((m) => m.ImpactoMap), {
  ssr: false,
  loading: () => <div className="h-[60vh] w-full animate-pulse rounded-md bg-piedra/10 md:h-[70vh]" />,
})

export function ImpactoMapLoader(props: {
  comunidades: ComunidadFeature[]
  sedes: SedeFeature[]
  programas: { id: number; nombre: string; color: string }[]
  maptilerKey?: string
  locale: string
  stats: { comunidades: number; sedes: number; proyectosActivos: number; obrasCompletadas: number }
  textos: Textos
}) {
  return <ImpactoMap {...props} />
}
