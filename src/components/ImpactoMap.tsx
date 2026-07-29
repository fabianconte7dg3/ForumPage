'use client'

import { Map as MapLibreMap, NavigationControl, Popup, setWorkerUrl, type MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'

// maplibre-gl calcula la URL de su worker con `import.meta.url`, que bajo el
// bundling de webpack (Next.js) no resuelve a una ruta real y rompe con un
// 404 en texto/html ("Failed to load module script"). Se sirve una copia
// propia desde /public (ver `postinstall` en package.json) y se apunta ahí.
setWorkerUrl('/maplibre-gl-worker.mjs')

// Tokens de docs/04-diseno-y-sistema-visual.md §3.1 — montana para la capa de
// sedes, cosecha para la sede destacada, rio para lo interactivo (comunidades).
const COLOR_MONTANA = '#17423b'
const COLOR_COSECHA = '#c08a1e'
const COLOR_RIO = '#2f7d8c'

export type ComunidadFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: { id: number; nombre: string; slug: string; programas: number[] }
}
export type SedeFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: { nombre: string; destacada: boolean }
}

export function ImpactoMap({
  comunidades,
  sedes,
  programas,
  maptilerKey,
  locale,
  textoVerFicha,
  textoTodos,
}: {
  comunidades: ComunidadFeature[]
  sedes: SedeFeature[]
  programas: { id: number; nombre: string; color: string }[]
  maptilerKey?: string
  locale: string
  textoVerFicha: string
  textoTodos: string
}) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<MapLibreMap | null>(null)
  const [filtroPrograma, setFiltroPrograma] = useState<number | null>(null)

  useEffect(() => {
    if (!contenedorRef.current) return

    const mapa = new MapLibreMap({
      container: contenedorRef.current,
      // ponytail: sin MAPTILER_KEY en dev, cae a las teselas demo (sin llave)
      // de MapLibre. Con la llave en producción usa las teselas reales.
      style: maptilerKey
        ? `https://api.maptiler.com/maps/streets/style.json?key=${maptilerKey}`
        : 'https://demotiles.maplibre.org/style.json',
      center: [-80.4, 8.75], // Coclé norte
      zoom: 9,
    })
    mapa.addControl(new NavigationControl(), 'top-right')
    mapaRef.current = mapa

    mapa.on('load', () => {
      mapa.addSource('comunidades', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: comunidades },
      })
      mapa.addLayer({
        id: 'comunidades-layer',
        type: 'circle',
        source: 'comunidades',
        paint: {
          'circle-radius': 8,
          'circle-color': COLOR_RIO,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#f2f4f1',
        },
      })

      mapa.addSource('sedes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: sedes },
      })
      mapa.addLayer({
        id: 'sedes-layer',
        type: 'circle',
        source: 'sedes',
        paint: {
          'circle-radius': ['case', ['get', 'destacada'], 10, 6],
          'circle-color': ['case', ['get', 'destacada'], COLOR_COSECHA, COLOR_MONTANA],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#f2f4f1',
        },
      })

      mapa.on('mouseenter', 'comunidades-layer', () => {
        mapa.getCanvas().style.cursor = 'pointer'
      })
      mapa.on('mouseleave', 'comunidades-layer', () => {
        mapa.getCanvas().style.cursor = ''
      })
      mapa.on('click', 'comunidades-layer', (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0] as unknown as ComunidadFeature | undefined
        if (!feature) return
        const coords = feature.geometry.coordinates

        const enlace = document.createElement('a')
        enlace.href = `/${locale}/impacto/comunidades/${feature.properties.slug}`
        enlace.textContent = textoVerFicha
        enlace.className = 'text-sm font-medium text-rio hover:underline'

        const titulo = document.createElement('p')
        titulo.textContent = feature.properties.nombre
        titulo.className = 'mb-1 font-display font-bold text-montana'

        const contenido = document.createElement('div')
        contenido.append(titulo, enlace)

        new Popup().setLngLat(coords).setDOMContent(contenido).addTo(mapa)
      })

      mapa.on('mouseenter', 'sedes-layer', () => {
        mapa.getCanvas().style.cursor = 'pointer'
      })
      mapa.on('mouseleave', 'sedes-layer', () => {
        mapa.getCanvas().style.cursor = ''
      })
      mapa.on('click', 'sedes-layer', (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0] as unknown as SedeFeature | undefined
        if (!feature) return
        const coords = feature.geometry.coordinates
        new Popup().setLngLat(coords).setText(feature.properties.nombre).addTo(mapa)
      })
    })

    return () => mapa.remove()
    // Solo se inicializa una vez: los cambios de filtro se aplican con setFilter más abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || !mapa.getLayer('comunidades-layer')) return
    mapa.setFilter(
      'comunidades-layer',
      filtroPrograma === null ? null : ['in', filtroPrograma, ['get', 'programas']],
    )
  }, [filtroPrograma])

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="group">
        <button
          aria-pressed={filtroPrograma === null}
          className={`rounded-full border px-3 py-1 font-dato text-xs uppercase tracking-wider ${
            filtroPrograma === null
              ? 'border-montana bg-montana text-niebla'
              : 'border-piedra/25 text-tinta hover:border-montana'
          }`}
          onClick={() => setFiltroPrograma(null)}
          type="button"
        >
          {textoTodos}
        </button>
        {programas.map((programa) => (
          <button
            aria-pressed={filtroPrograma === programa.id}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 font-dato text-xs uppercase tracking-wider ${
              filtroPrograma === programa.id
                ? 'border-montana bg-montana text-niebla'
                : 'border-piedra/25 text-tinta hover:border-montana'
            }`}
            key={programa.id}
            onClick={() => setFiltroPrograma(programa.id)}
            type="button"
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: programa.color }}
            />
            {programa.nombre}
          </button>
        ))}
      </div>

      <div className="h-[60vh] w-full overflow-hidden rounded-md border border-piedra/25 md:h-[70vh]" ref={contenedorRef} />
    </div>
  )
}
