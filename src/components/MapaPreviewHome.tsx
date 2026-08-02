'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl('/maplibre-gl-worker.mjs')

type Props = {
  locale: string
  maptilerKey?: string
  comunidades: { id: number; nombre: string; lat: number; lng: number }[]
}

export function MapaPreviewHome({ locale, maptilerKey, comunidades }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const styleConfig = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
      : {
          version: 8 as const,
          sources: {
            'carto-voyager': {
              type: 'raster' as const,
              tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap &copy; CARTO',
            },
          },
          layers: [
            {
              id: 'carto-voyager-layer',
              type: 'raster' as const,
              source: 'carto-voyager',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        }

    const map = new MapLibreMap({
      container: containerRef.current,
      style: styleConfig,
      center: [-80.3621, 8.6186], // Centro de Coclé Norte
      zoom: 9.2,
      interactive: true,
      attributionControl: false,
    })

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')

    const comunidadesReales = comunidades.filter((c) => c.nombre !== 'Sin clasificar')

    map.on('load', () => {
      // GeoJSON de comunidades
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: comunidadesReales.map((c) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
          properties: { nombre: c.nombre },
        })),
      }

      map.addSource('comunidades-home', {
        type: 'geojson',
        data: geojson,
      })

      // Capa de puntos
      map.addLayer({
        id: 'comunidades-puntos',
        type: 'circle',
        source: 'comunidades-home',
        paint: {
          'circle-color': '#2f7d8c',
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Capa de etiquetas de texto
      map.addLayer({
        id: 'comunidades-texto',
        type: 'symbol',
        source: 'comunidades-home',
        layout: {
          'text-field': ['get', 'nombre'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#17423b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [comunidades, maptilerKey])

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-sm border border-piedra/25 bg-niebla md:col-span-2">
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Badge superior */}
      <div className="absolute top-3 left-3 z-10 rounded-2px border border-piedra/25 bg-white/95 px-3 py-1.5 backdrop-blur-xs">
        <p className="font-dato text-[11px] font-bold uppercase tracking-wider text-montana">
          📍 Coclé Norte · {comunidades.length} Comunidades
        </p>
      </div>

      {/* Botón flotante para ver mapa completo */}
      <Link
        href={`/${locale}/impacto`}
        className="absolute bottom-3 left-3 z-10 rounded-sm border border-montana bg-montana px-3 py-1.5 font-dato text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90"
      >
        Explorar Mapa Completo →
      </Link>
    </div>
  )
}
