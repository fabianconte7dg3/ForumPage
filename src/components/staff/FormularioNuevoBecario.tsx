'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearBecario } from '@/actions/crear-becario'
import type { Locale } from '@/i18n'

type ComunidadSimple = {
  id: number
  nombre: string
}

type DestinoSimple = {
  id: number
  universidad: string
  pais: string
  ciudad: string
  coordenadas: { lat: number; lng: number }
  bandera?: string | null
}

type Props = {
  locale: Locale
  comunidades: ComunidadSimple[]
  destinos: DestinoSimple[]
}

export function FormularioNuevoBecario({ locale, comunidades, destinos }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [enlaceGenerado, setEnlaceGenerado] = useState<string | null>(null)
  const [avisoCuenta, setAvisoCuenta] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Form states
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [comunidadId, setComunidadId] = useState<number | undefined>(undefined)
  const [nivelEducativo, setNivelEducativo] = useState<'primaria' | 'premedia' | 'media' | 'universidad'>('universidad')
  const [tipoApoyo, setTipoApoyo] = useState<('hospedaje' | 'transporte' | 'alimento')[]>([])
  const [universidad, setUniversidad] = useState('')
  const [carrera, setCarrera] = useState('')
  const [anio, setAnio] = useState<number | ''>('')
  const [anioInicio, setAnioInicio] = useState<number | ''>(new Date().getFullYear())
  const [tipoEstudio, setTipoEstudio] = useState<'nacional' | 'internacional'>('nacional')
  const [paisEstudio, setPaisEstudio] = useState('')
  const [ciudadEstudio, setCiudadEstudio] = useState('')
  const [lat, setLat] = useState<number | ''>('')
  const [lng, setLng] = useState<number | ''>('')
  const [estado, setEstado] = useState<'activo' | 'suspendido' | 'graduado' | 'retornado' | 'retirado'>('activo')
  const [consentimientoFirmado, setConsentimientoFirmado] = useState(false)
  const [mostrarEnMapa, setMostrarEnMapa] = useState(false)
  const [cita, setCita] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const res = await crearBecario({
      nombre,
      email,
      comunidadId: comunidadId ? Number(comunidadId) : undefined,
      nivel_educativo: nivelEducativo,
      tipo_apoyo: tipoApoyo,
      universidad,
      carrera,
      anio: anio !== '' ? Number(anio) : undefined,
      anio_inicio: anioInicio !== '' ? Number(anioInicio) : undefined,
      tipo_estudio: tipoEstudio,
      pais_estudio: paisEstudio,
      ciudad_estudio: ciudadEstudio,
      lat: lat !== '' ? Number(lat) : undefined,
      lng: lng !== '' ? Number(lng) : undefined,
      estado,
      consentimiento_firmado: consentimientoFirmado,
      mostrar_en_mapa: mostrarEnMapa,
      cita,
      locale,
    })

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
      return
    }

    // Reset form
    setNombre('')
    setEmail('')
    setNivelEducativo('universidad')
    setTipoApoyo([])
    setUniversidad('')
    setCarrera('')
    setCita('')
    setConsentimientoFirmado(false)
    setMostrarEnMapa(false)
    router.refresh()

    // No se cierra el modal todavía: primero hay que darle al staff la
    // chance de copiar el enlace de invitación, que solo se muestra una vez.
    setEnlaceGenerado(res.enlaceInvitacion ?? null)
    setAvisoCuenta(res.avisoCuenta ?? null)
  }

  const cerrarTrasExito = () => {
    setAbierto(false)
    setEnlaceGenerado(null)
    setAvisoCuenta(null)
    setCopiado(false)
  }

  const copiarEnlace = async () => {
    if (!enlaceGenerado) return
    await navigator.clipboard.writeText(enlaceGenerado)
    setCopiado(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90"
      >
        + Registrar Becario
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Gestión de Becarios</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">Registrar Nuevo Becario</h2>
              </div>
              <button
                type="button"
                onClick={cerrarTrasExito}
                className="font-dato text-sm font-bold text-piedra hover:text-tinta"
              >
                ✕
              </button>
            </div>

            {enlaceGenerado || avisoCuenta ? (
              <div className="space-y-4">
                <div className="rounded-sm border border-montana/30 bg-montana/5 p-4">
                  <p className="mb-2 font-lectura text-sm text-tinta">
                    Becario registrado. {enlaceGenerado ? 'Copiá este enlace y enviaselo — vence en 1 hora y es de un solo uso:' : null}
                  </p>
                  {enlaceGenerado && (
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={enlaceGenerado}
                        onFocus={(e) => e.target.select()}
                        className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-dato text-xs text-tinta outline-none"
                      />
                      <button
                        type="button"
                        onClick={copiarEnlace}
                        className="shrink-0 rounded-sm border border-montana bg-montana px-3 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white hover:bg-montana/90"
                      >
                        {copiado ? 'Copiado ✓' : 'Copiar'}
                      </button>
                    </div>
                  )}
                  {avisoCuenta && (
                    <p className="font-lectura text-sm text-cosecha">{avisoCuenta}</p>
                  )}
                </div>
                <div className="flex justify-end border-t border-piedra/25 pt-4">
                  <button
                    type="button"
                    onClick={cerrarTrasExito}
                    className="rounded-sm border border-montana bg-montana px-5 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white hover:bg-montana/90"
                  >
                    Listo
                  </button>
                </div>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="mb-4 rounded-sm border border-cosecha/50 bg-cosecha/10 p-3 font-lectura text-sm text-tinta">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Nombre completo <span className="text-cosecha">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Correo del becario <span className="text-cosecha">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="becario@correo.com"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                  <p className="mt-1 font-lectura text-xs text-tinta/50">
                    Al guardar se crea su cuenta y un enlace de invitación de un solo uso, listo para copiar.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Comunidad de origen
                  </label>
                  <select
                    value={comunidadId ?? ''}
                    onChange={(e) => setComunidadId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana bg-white"
                  >
                    <option value="">-- Seleccionar Comunidad --</option>
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Nivel Educativo
                  </label>
                  <select
                    value={nivelEducativo}
                    onChange={(e) => setNivelEducativo(e.target.value as typeof nivelEducativo)}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana bg-white"
                  >
                    <option value="primaria">Primaria (Becas de Comunidad)</option>
                    <option value="premedia">Premedia (Becas de Comunidad)</option>
                    <option value="media">Media (Becas de Comunidad)</option>
                    <option value="universidad">Universidad (Becas Keffer)</option>
                  </select>
                </div>
              </div>

              {nivelEducativo === 'universidad' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Universidad / Centro
                  </label>
                  <input
                    type="text"
                    value={universidad}
                    onChange={(e) => setUniversidad(e.target.value)}
                    placeholder="Ej. Universidad de Panamá"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Carrera
                  </label>
                  <input
                    type="text"
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value)}
                    placeholder="Ej. Licenciatura en Educación"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {nivelEducativo === 'universidad' && (
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Año que cursa
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={anio}
                    onChange={(e) => setAnio(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 2"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
                )}

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Año inicio de beca
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={anioInicio}
                    onChange={(e) => setAnioInicio(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Estado de Beca
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as 'activo' | 'suspendido' | 'graduado' | 'retornado' | 'retirado')}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana bg-white"
                  >
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                    <option value="graduado">Graduado</option>
                    <option value="retornado">Retornado</option>
                    <option value="retirado">Retirado</option>
                  </select>
                </div>
              </div>

              <div className="rounded-sm border border-piedra/15 bg-niebla/40 p-4">
                <label className="mb-2 block font-dato text-xs font-bold uppercase tracking-widest text-montana">
                  Tipo de Estudios
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 font-lectura text-sm text-tinta cursor-pointer">
                    <input
                      type="radio"
                      name="tipoEstudio"
                      checked={tipoEstudio === 'nacional'}
                      onChange={() => setTipoEstudio('nacional')}
                      className="accent-montana"
                    />
                    <span>Nacional (Panamá)</span>
                  </label>
                  <label className="flex items-center space-x-2 font-lectura text-sm text-tinta cursor-pointer">
                    <input
                      type="radio"
                      name="tipoEstudio"
                      checked={tipoEstudio === 'internacional'}
                      onChange={() => setTipoEstudio('internacional')}
                      className="accent-montana"
                    />
                    <span>Internacional (Extranjero)</span>
                  </label>
                </div>

                {tipoEstudio === 'internacional' && (
                  <div className="mt-4 pt-3 border-t border-piedra/25 space-y-4">
                    <div>
                      <label className="mb-1 block font-dato text-xs font-bold uppercase tracking-widest text-montana">
                        Sugerencia / Destino Frecuente
                      </label>
                      <select
                        onChange={(e) => {
                          const destino = destinos.find((d) => String(d.id) === e.target.value)
                          if (!destino) return
                          setUniversidad(destino.universidad)
                          setPaisEstudio(destino.pais)
                          setCiudadEstudio(destino.ciudad)
                          setLat(destino.coordenadas.lat)
                          setLng(destino.coordenadas.lng)
                        }}
                        className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                      >
                        <option value="">-- Seleccionar si aplica o ingresar manual abajo --</option>
                        {destinos.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.bandera ? `${d.bandera} ` : ''}
                            {d.universidad} ({d.ciudad}, {d.pais})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                          País de destino
                        </label>
                        <input
                          type="text"
                          value={paisEstudio}
                          onChange={(e) => setPaisEstudio(e.target.value)}
                          placeholder="Ej. Italia"
                          className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                          Ciudad de destino
                        </label>
                        <input
                          type="text"
                          value={ciudadEstudio}
                          onChange={(e) => setCiudadEstudio(e.target.value)}
                          placeholder="Ej. Milán"
                          className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                          Latitud (GPS)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={lat}
                          onChange={(e) => setLat(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Ej. 45.4497"
                          className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana font-dato text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                          Longitud (GPS)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={lng}
                          onChange={(e) => setLng(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Ej. 9.1895"
                          className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana font-dato text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Tipo de Apoyo (además de la beca académica)
                </label>
                <div className="flex flex-wrap gap-4">
                  {(['hospedaje', 'transporte', 'alimento'] as const).map((tipo) => (
                    <label key={tipo} className="flex items-center space-x-2 font-lectura text-sm capitalize text-tinta cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tipoApoyo.includes(tipo)}
                        onChange={(e) =>
                          setTipoApoyo((prev) => (e.target.checked ? [...prev, tipo] : prev.filter((t) => t !== tipo)))
                        }
                        className="accent-montana"
                      />
                      <span>{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 font-lectura text-sm text-tinta cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentimientoFirmado}
                    onChange={(e) => {
                      setConsentimientoFirmado(e.target.checked)
                      if (!e.target.checked) setMostrarEnMapa(false)
                    }}
                    className="accent-montana"
                  />
                  <span>Consentimiento de imagen firmado</span>
                </label>

                <label className="flex items-center space-x-2 font-lectura text-sm text-tinta cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarEnMapa}
                    disabled={!consentimientoFirmado}
                    onChange={(e) => setMostrarEnMapa(e.target.checked)}
                    className="accent-montana disabled:opacity-50"
                  />
                  <span className={!consentimientoFirmado ? 'text-piedra' : ''}>
                    Mostrar becario en el Mapa de Impacto
                  </span>
                </label>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Frase o Cita Inspiradora
                </label>
                <textarea
                  rows={2}
                  value={cita}
                  onChange={(e) => setCita(e.target.value)}
                  placeholder="Ej. 'Gracias a la beca he podido cumplir mi sueño de estudiar medicina...'"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-piedra/25">
                <button
                  type="button"
                  onClick={cerrarTrasExito}
                  className="rounded-sm border border-piedra/25 px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-tinta hover:bg-niebla"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-sm border border-montana bg-montana px-5 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : 'Registrar Becario'}
                </button>
              </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
