'use client'

import { Map as MapLibreMap, NavigationControl, setWorkerUrl, type MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// maplibre-gl calcula la URL de su worker con `import.meta.url`, que bajo el
// bundling de webpack (Next.js) no resuelve a una ruta real y rompe con un
// 404 en texto/html ("Failed to load module script"). Se sirve una copia
// propia desde /public (ver `postinstall` en package.json) y se apunta ahí.
// El worker a su vez importa `./maplibre-gl-shared.mjs`, también copiado.
setWorkerUrl('/maplibre-gl-worker.mjs')

// Tokens de docs/04-diseno-y-sistema-visual.md §3.1 — montana para la capa de
// sedes, cosecha para la sede destacada, rio para lo interactivo (comunidades).
const COLOR_MONTANA = '#17423b'
const COLOR_COSECHA = '#c08a1e'
const COLOR_RIO = '#2f7d8c'

type Proyecto = { id: number; titulo: string; slug: string; estadoLabel: string; avance: number }

export type ComunidadFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    id: number
    nombre: string
    slug: string
    distrito: string
    descripcion?: string
    programas: number[]
    proyectos: Proyecto[]
    avanceProm: number | null
    actividadesLabel: string
  }
}
export type SedeFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    nombre: string
    destacada: boolean
    tipoLabel: string
    horario?: string
    comunidadNombre?: string
    comunidadSlug?: string
  }
}

export type BecarioFeature = {
  id: number
  nombre: string
  carrera: string
  universidad: string
  pais_estudio: string
  ciudad_estudio: string
  comunidad_nombre: string
  comunidad_slug?: string
  foto_url?: string
  cita?: string
  anio?: number
  origen: [number, number]
  destino: [number, number]
}


export type Textos = {
  todos: string
  verFicha: string
  statComunidades: string
  statSedes: string
  statProyectosActivos: string
  statObrasCompletadas: string
  statBecariosActivos: string
  statPaises: string
  capas: string
  capaComunidades: string
  capaSedes: string
  lugares: string
  sinProyectos: string
  proyectosEnComunidad: string
  avance: string
  cerrar: string
}

type Seleccion = { tipo: 'comunidad'; data: ComunidadFeature['properties'] } | { tipo: 'sede'; data: SedeFeature['properties'] } | { tipo: 'becario'; data: Omit<BecarioFeature, 'origen' | 'destino'> }

export function ImpactoMap({
  becarios,
  comunidades,
  sedes,
  programas,
  maptilerKey,
  locale,
  stats,
  textos: t,
}: {
  becarios: BecarioFeature[]
  comunidades: ComunidadFeature[]
  sedes: SedeFeature[]
  programas: { id: number; nombre: string; color: string }[]
  maptilerKey?: string
  locale: string
  stats: { comunidades: number; sedes: number; proyectosActivos: number; obrasCompletadas: number; becariosActivos: number }
  textos: Textos
}) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<MapLibreMap | null>(null)
  const [filtroPrograma, setFiltroPrograma] = useState<number | null>(null)
  const [capasVisibles, setCapasVisibles] = useState({ comunidades: true, sedes: true, becarios: true })
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null)

  useEffect(() => {
    if (!contenedorRef.current) return

    const estiloMapa = maptilerKey
      ? `https://api.maptiler.com/maps/streets/style.json?key=${maptilerKey}`
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

    const mapa = new MapLibreMap({
      container: contenedorRef.current,
      style: estiloMapa,
      center: [-80.4, 8.75], // Coclé norte
      zoom: 9.5,
    })
    mapa.addControl(new NavigationControl(), 'top-right')
    mapaRef.current = mapa

    mapa.on('load', () => {
      // Capa base de distritos (Coclé)
      mapa.addSource('distritos', {
        type: 'geojson',
        data: '/cocle-distritos.geojson',
      })
      mapa.addLayer({
        id: 'distritos-fill-layer',
        type: 'fill',
        source: 'distritos',
        paint: {
          'fill-color': [
            'match',
            ['get', 'name'],
            'La Pintada', '#e2cbe8',
            'Penonomé', '#fef1ad',
            'Olá', '#dcecb1',
            'Natá', '#f8d49a',
            'Aguadulce', '#fffcb3',
            'Antón', '#f5c1c8',
            /* default */ '#eeeeee',
          ],
          'fill-opacity': 0.35,
        },
      })
      mapa.addLayer({
        id: 'distritos-line-layer',
        type: 'line',
        source: 'distritos',
        paint: {
          'line-color': '#78716c',
          'line-width': 1.5,
          'line-dasharray': [2, 2],
        },
      })

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
          'circle-stroke-color': '#ffffff',
        },
      })
      mapa.addLayer({
        id: 'comunidades-labels-layer',
        type: 'symbol',
        source: 'comunidades',
        layout: {
          'text-field': ['get', 'nombre'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#1c1917',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
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
          'circle-stroke-color': '#ffffff',
        },
      })
      mapa.addLayer({
        id: 'sedes-labels-layer',
        type: 'symbol',
        source: 'sedes',
        layout: {
          'text-field': ['get', 'nombre'],
          'text-size': 11,
          'text-offset': [0, -1.2],
          'text-anchor': 'bottom',
        },
        paint: {
          'text-color': '#17423b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
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
        setSeleccion({ tipo: 'comunidad', data: feature.properties })
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
        setSeleccion({ tipo: 'sede', data: feature.properties })
      })

      // Trayectoria de becarios (línea origen → destino)
      const becariosTrayectorias = becarios.map((b) => ({
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: [b.origen, b.destino] },
        properties: { ...b },
      }))
      mapa.addSource('becarios-trayectorias', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: becariosTrayectorias },
      })
      mapa.addLayer({
        id: 'becarios-trayectorias-layer',
        type: 'line',
        source: 'becarios-trayectorias',
        paint: {
          'line-color': COLOR_COSECHA,
          'line-width': 1.5,
          'line-dasharray': [2, 2],
        },
      })

      // Destinos de becarios (puntos)
      const becariosDestinos = becarios.map((b) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: b.destino },
        properties: { ...b },
      }))
      mapa.addSource('becarios-destinos', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: becariosDestinos },
      })
      mapa.addLayer({
        id: 'becarios-destinos-layer',
        type: 'circle',
        source: 'becarios-destinos',
        paint: {
          'circle-radius': 6,
          'circle-color': COLOR_COSECHA,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
      
      mapa.on('mouseenter', 'becarios-destinos-layer', () => {
        mapa.getCanvas().style.cursor = 'pointer'
      })
      mapa.on('mouseleave', 'becarios-destinos-layer', () => {
        mapa.getCanvas().style.cursor = ''
      })
      mapa.on('click', 'becarios-destinos-layer', (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0] as unknown as { properties: BecarioFeature } | undefined
        if (!feature) return
        setSeleccion({ tipo: 'becario', data: feature.properties })
      })
    })

    return () => mapa.remove()
    // Solo se inicializa una vez: los cambios de filtro/capas se aplican con los efectos de abajo.
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

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || !mapa.getLayer('comunidades-layer') || !mapa.getLayer('sedes-layer')) return
    mapa.setLayoutProperty('comunidades-layer', 'visibility', capasVisibles.comunidades ? 'visible' : 'none')
    mapa.setLayoutProperty('sedes-layer', 'visibility', capasVisibles.sedes ? 'visible' : 'none')
    if (mapa.getLayer('becarios-destinos-layer')) {
      mapa.setLayoutProperty('becarios-destinos-layer', 'visibility', capasVisibles.becarios ? 'visible' : 'none')
    }
    if (mapa.getLayer('becarios-trayectorias-layer')) {
      mapa.setLayoutProperty('becarios-trayectorias-layer', 'visibility', capasVisibles.becarios ? 'visible' : 'none')
    }
  }, [capasVisibles])

  const seleccionarComunidad = (comunidad: ComunidadFeature) => {
    mapaRef.current?.flyTo({ center: comunidad.geometry.coordinates, zoom: 12 })
    setSeleccion({ tipo: 'comunidad', data: comunidad.properties })
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-2">
          <StatCard label={t.statComunidades} value={stats.comunidades} />
          <StatCard label={t.statObrasCompletadas} value={stats.obrasCompletadas} />
          <StatCard label={t.statBecariosActivos} value={stats.becariosActivos} />
          <StatCard label={t.statSedes} value={stats.sedes} />
          <StatCard label={t.statProyectosActivos} value={stats.proyectosActivos} />
          <StatCard label={t.statPaises} value={new Set(becarios.map((b) => b.pais_estudio).filter(Boolean)).size || '—'} />
        </div>

        <div>
          <h2 className="mb-2 font-dato text-xs uppercase tracking-widest text-piedra">{t.capas}</h2>
          <label className="flex items-center gap-2 py-1 font-lectura text-sm text-tinta">
            <input
              checked={capasVisibles.comunidades}
              className="h-4 w-4 accent-rio"
              onChange={(e) => setCapasVisibles((v) => ({ ...v, comunidades: e.target.checked }))}
              type="checkbox"
            />
            {t.capaComunidades}
            <span className="ml-auto font-dato text-xs text-piedra">{stats.comunidades}</span>
          </label>
          <label className="flex items-center gap-2 py-1 font-lectura text-sm text-tinta">
            <input
              checked={capasVisibles.sedes}
              className="h-4 w-4 accent-montana"
              onChange={(e) => setCapasVisibles((v) => ({ ...v, sedes: e.target.checked }))}
              type="checkbox"
            />
            {t.capaSedes}
            <span className="ml-auto font-dato text-xs text-piedra">{stats.sedes}</span>
          </label>
          <label className="flex items-center gap-2 py-1 font-lectura text-sm text-tinta">
            <input
              checked={capasVisibles.becarios}
              className="h-4 w-4 accent-cosecha"
              onChange={(e) => setCapasVisibles((v) => ({ ...v, becarios: e.target.checked }))}
              type="checkbox"
            />
            Becarios Internacionales
            <span className="ml-auto font-dato text-xs text-piedra">{becarios.length}</span>
          </label>
        </div>

        <div>
          <h2 className="mb-2 font-dato text-xs uppercase tracking-widest text-piedra">{t.todos}</h2>
          <div className="flex flex-wrap gap-2">
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
              {t.todos}
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
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: programa.color }} />
                {programa.nombre}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <h2 className="mb-2 font-dato text-xs uppercase tracking-widest text-piedra">{t.lugares}</h2>
          <ul className="max-h-64 divide-y divide-piedra/10 overflow-y-auto rounded-md border border-piedra/25 lg:max-h-none lg:flex-1">
            {comunidades.map((comunidad) => (
              <li key={comunidad.properties.id}>
                <button
                  className="flex w-full items-center justify-between px-3 py-2 text-left font-lectura text-sm text-tinta hover:bg-niebla"
                  onClick={() => seleccionarComunidad(comunidad)}
                  type="button"
                >
                  {comunidad.properties.nombre}
                  <span className="font-dato text-xs font-medium text-piedra">
                    {comunidad.properties.avanceProm === null ? '—' : `${comunidad.properties.avanceProm}%`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="relative">
        <div
          className="h-[60vh] w-full overflow-hidden rounded-md border border-piedra/25 md:h-[70vh]"
          ref={contenedorRef}
        />

        {seleccion && (
          <div className="fixed inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-y-auto rounded-t-xl border-t border-piedra/25 bg-niebla p-5 shadow-lg md:absolute md:inset-x-auto md:bottom-4 md:right-4 md:top-4 md:max-h-none md:w-80 md:rounded-md md:border">
            <button
              aria-label={t.cerrar}
              className="absolute right-3 top-3 font-dato text-xs uppercase text-piedra hover:text-montana"
              onClick={() => setSeleccion(null)}
              type="button"
            >
              ✕
            </button>

            {seleccion.tipo === 'comunidad' ? (
              <PanelComunidad data={seleccion.data} locale={locale} t={t} />
            ) : seleccion.tipo === 'sede' ? (
              <PanelSede data={seleccion.data} locale={locale} t={t} />
            ) : (
              <PanelBecario data={seleccion.data} locale={locale} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-piedra/25 p-3">
      <p className="font-dato text-2xl font-bold text-montana">{value}</p>
      <p className="font-dato text-[10px] uppercase tracking-wider text-piedra">{label}</p>
    </div>
  )
}

function PanelComunidad({ data, locale, t }: { data: ComunidadFeature['properties']; locale: string; t: Textos }) {
  return (
    <div>
      <p className="mb-1 font-dato text-xs uppercase tracking-widest text-piedra">{data.distrito}</p>
      <h3 className="mb-2 pr-6 font-display text-xl font-bold text-montana">{data.nombre}</h3>
      {data.descripcion && <p className="mb-4 font-lectura text-sm text-tinta/70">{data.descripcion}</p>}

      {typeof data.avanceProm === 'number' && (
        <div className="mb-4">
          <div className="h-2 w-full rounded-full bg-piedra/15">
            <div className="h-2 rounded-full bg-cosecha" style={{ width: `${data.avanceProm}%` }} />
          </div>
          <p className="mt-1 font-dato text-xs text-tinta/60">
            {t.avance}: {data.avanceProm}%
          </p>
        </div>
      )}

      <div className="mb-4 flex gap-4 font-dato text-xs text-tinta/60">
        <span>{data.proyectos.length} proyectos</span>
        <span>{data.actividadesLabel}</span>
      </div>

      <h4 className="mb-2 font-dato text-xs uppercase tracking-wider text-piedra">{t.proyectosEnComunidad}</h4>
      {data.proyectos.length === 0 ? (
        <p className="mb-4 font-lectura text-sm text-tinta/70">{t.sinProyectos}</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {data.proyectos.map((proyecto) => (
            <li className="rounded-md border border-piedra/25 p-2" key={proyecto.id}>
              <p className="font-lectura text-sm font-medium text-tinta">{proyecto.titulo}</p>
              <p className="font-dato text-xs text-piedra">
                {proyecto.estadoLabel} · {proyecto.avance}%
              </p>
            </li>
          ))}
        </ul>
      )}

      <Link className="font-dato text-xs uppercase tracking-wider text-rio hover:underline" href={`/${locale}/impacto/comunidades/${data.slug}`}>
        {t.verFicha}
      </Link>
    </div>
  )
}

function PanelSede({ data, locale, t }: { data: SedeFeature['properties']; locale: string; t: Textos }) {
  return (
    <div>
      <p className="mb-1 font-dato text-xs uppercase tracking-widest text-piedra">
        {data.tipoLabel}
        {data.comunidadNombre ? ` · ${data.comunidadNombre}` : ''}
      </p>
      <h3 className="mb-2 pr-6 font-display text-xl font-bold text-montana">{data.nombre}</h3>
      {data.destacada && (
        <span className="mb-4 inline-block rounded-full bg-cosecha/15 px-2 py-0.5 font-dato text-xs uppercase tracking-wider text-cosecha">
          Academia Forum
        </span>
      )}
      {data.horario && <p className="mb-4 font-lectura text-sm text-tinta/70">{data.horario}</p>}
      {data.comunidadSlug && (
        <Link className="font-dato text-xs uppercase tracking-wider text-rio hover:underline" href={`/${locale}/impacto/comunidades/${data.comunidadSlug}`}>
          {t.verFicha}
        </Link>
      )}
    </div>
  )
}

function PanelBecario({ data, locale }: { data: Omit<BecarioFeature, 'origen' | 'destino'>; locale: string }) {
  const fotoUrl = data.foto_url
  const isEn = locale === 'en'

  return (
    <div className="space-y-4">
      {/* Encabezado de Trayectoria */}
      <div className="flex items-center justify-between border-b border-piedra/25 pb-2">
        <span className="font-dato text-[10px] font-bold uppercase tracking-widest text-montana">
          {isEn ? 'International Trajectory' : 'Trayectoria Internacional'}
        </span>
        {data.anio && (
          <span className="rounded-2px bg-montana/10 px-2 py-0.5 font-dato text-[10px] font-bold text-montana">
            {isEn ? `Year ${data.anio}` : `${data.anio}° AÑO`}
          </span>
        )}
      </div>

      {/* Foto de perfil + Nombre */}
      <div className="flex items-start gap-3">
        {fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={data.nombre}
            className="h-14 w-14 rounded-sm object-cover border border-piedra/25 shrink-0"
            src={fotoUrl}
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-piedra/25 bg-montana/10 font-display text-lg font-bold text-montana">
            {data.nombre.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold uppercase leading-tight text-montana">
            {data.nombre}
          </h3>
          <p className="mt-1 font-lectura text-xs font-semibold text-tinta">
            {data.carrera}
          </p>
          <p className="font-lectura text-xs text-tinta/70">
            {data.universidad}
          </p>
        </div>
      </div>

      {/* Ruta: Origen -> Destino */}
      <div className="rounded-sm border border-piedra/15 bg-white p-3 space-y-2">
        <div className="flex items-center gap-2 font-dato text-xs">
          <span className="text-montana font-bold">{isEn ? '📍 ORIGIN:' : '📍 ORIGEN:'}</span>
          <span className="font-semibold text-tinta">{data.comunidad_nombre}</span>
        </div>
        <div className="flex items-center gap-2 font-dato text-xs">
          <span className="text-cosecha font-bold">{isEn ? '✈ DESTINATION:' : '✈ DESTINO:'}</span>
          <span className="font-semibold text-tinta">
            {data.ciudad_estudio}, {data.pais_estudio}
          </span>
        </div>
      </div>

      {/* Cita inspiradora */}
      {data.cita && (
        <blockquote className="border-l-2 border-cosecha pl-3 py-1 font-lectura text-xs italic text-tinta/80 bg-cosecha/5 rounded-r-sm">
          «{data.cita}»
        </blockquote>
      )}

      {/* Enlace opcional a la comunidad */}
      {data.comunidad_slug && (
        <div className="pt-2 border-t border-piedra/25">
          <Link
            className="inline-block font-dato text-xs uppercase tracking-wider text-rio hover:underline"
            href={`/${locale}/impacto/comunidades/${data.comunidad_slug}`}
          >
            {isEn ? `View community ${data.comunidad_nombre} →` : `Ver comunidad ${data.comunidad_nombre} →`}
          </Link>
        </div>
      )}
    </div>
  )
}

