'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearSolicitudServicio } from '@/actions/crear-solicitud-servicio'
import { editarSolicitudServicio } from '@/actions/editar-solicitud-servicio'
import type { SolicitudServicio } from '@/payload-types'
import type { Locale } from '@/i18n'

type ComunidadOption = { id: number; nombre: string }

type Props = {
  locale: Locale
  solicitud?: SolicitudServicio
  comunidades: ComunidadOption[]
  triggerText?: string
  variant?: 'primary' | 'secondary' | 'badge'
}

export function FormularioSolicitudServicioModal({
  locale,
  solicitud,
  comunidades,
  triggerText,
  variant = 'primary',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!solicitud

  const [solicitante, setSolicitante] = useState(solicitud?.solicitante ?? '')
  const [comunidadId, setComunidadId] = useState<number | ''>(
    typeof solicitud?.comunidad === 'object' ? solicitud.comunidad?.id ?? '' : solicitud?.comunidad ?? ''
  )
  const [canal, setCanal] = useState<'whatsapp' | 'carta'>(solicitud?.canal ?? 'whatsapp')
  const [tipoServicio, setTipoServicio] = useState<'impresion_copia' | 'materiales_compras' | 'ambos'>(
    solicitud?.tipo_servicio ?? 'impresion_copia'
  )
  const [descripcion, setDescripcion] = useState(solicitud?.descripcion ?? '')
  const [cantidadHojas, setCantidadHojas] = useState<number | ''>(solicitud?.cantidad_hojas ?? '')
  const [lugarRetiro, setLugarRetiro] = useState(solicitud?.lugar_retiro ?? 'Auditorio')
  const [estado, setEstado] = useState<'recibida' | 'en_preparacion' | 'lista_para_retirar' | 'entregada' | 'cancelada'>(
    solicitud?.estado ?? 'recibida'
  )
  const [recibidoPor, setRecibidoPor] = useState(solicitud?.recibido_por ?? '')
  const [observaciones, setObservaciones] = useState(solicitud?.observaciones ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!solicitante.trim()) {
      setErrorMsg(locale === 'es' ? 'El nombre del solicitante es obligatorio.' : 'Applicant name is required.')
      return
    }

    if (!descripcion.trim()) {
      setErrorMsg(locale === 'es' ? 'El detalle de lo solicitado es obligatorio.' : 'Request detail is required.')
      return
    }

    setCargando(true)

    const base = {
      solicitante,
      comunidad: comunidadId ? Number(comunidadId) : undefined,
      canal,
      tipo_servicio: tipoServicio,
      descripcion,
      cantidad_hojas: cantidadHojas !== '' ? Number(cantidadHojas) : undefined,
      lugar_retiro: lugarRetiro || 'Auditorio',
      estado,
      recibido_por: recibidoPor || undefined,
      observaciones: observaciones || undefined,
      locale,
    }

    const res = esEdicion
      ? await editarSolicitudServicio({ ...base, id: solicitud.id })
      : await crearSolicitudServicio(base)

    setCargando(false)

    if ('error' in res && res.error) {
      setErrorMsg(res.error)
      return
    }

    setAbierto(false)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={
          variant === 'primary'
            ? 'inline-flex items-center gap-2 rounded-sm bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-wider text-niebla hover:bg-montana/90'
            : variant === 'badge'
            ? 'inline-flex items-center rounded-sm bg-niebla px-2.5 py-1 font-dato text-xs font-bold text-montana hover:bg-piedra/20'
            : 'inline-flex items-center gap-2 rounded-sm border border-piedra/30 px-3 py-1.5 font-dato text-xs uppercase tracking-wider text-tinta hover:bg-niebla'
        }
      >
        {triggerText ?? (esEdicion ? (locale === 'es' ? '✏ Editar / Trazabilidad' : '✏ Edit / Trace') : (locale === 'es' ? '+ Nueva Solicitud' : '+ New Request'))}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/60 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-xl rounded-sm border border-piedra/20 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-piedra/10 pb-3">
              <h3 className="font-display text-lg font-bold uppercase tracking-wide text-montana">
                {esEdicion
                  ? (locale === 'es' ? 'Editar / Trazabilidad de Solicitud' : 'Edit / Trace Request')
                  : (locale === 'es' ? 'Nueva Solicitud de Servicio' : 'New Service Request')}
              </h3>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="font-dato text-sm text-piedra hover:text-tinta"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 font-lectura text-xs text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                    {locale === 'es' ? 'Solicitante *' : 'Applicant *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={solicitante}
                    onChange={(e) => setSolicitante(e.target.value)}
                    placeholder={locale === 'es' ? 'Nombre de persona o escuela' : 'Person or school name'}
                    className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                    {locale === 'es' ? 'Comunidad' : 'Community'}
                  </label>
                  <select
                    value={comunidadId}
                    onChange={(e) => setComunidadId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                  >
                    <option value="">{locale === 'es' ? '-- Seleccionar comunidad --' : '-- Select community --'}</option>
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                    {locale === 'es' ? 'Canal de Recepción *' : 'Channel *'}
                  </label>
                  <select
                    value={canal}
                    onChange={(e) => setCanal(e.target.value as 'whatsapp' | 'carta')}
                    className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                  >
                    <option value="whatsapp">📱 WhatsApp</option>
                    <option value="carta">✉️ Carta Física</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                    {locale === 'es' ? 'Tipo de Servicio *' : 'Service Type *'}
                  </label>
                  <select
                    value={tipoServicio}
                    onChange={(e) => setTipoServicio(e.target.value as 'impresion_copia' | 'materiales_compras' | 'ambos')}
                    className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                  >
                    <option value="impresion_copia">🖨️ Impresiones / Fotocopias</option>
                    <option value="materiales_compras">📦 Materiales / Compras</option>
                    <option value="ambos">🖨️+📦 Ambos (Impresiones y Materiales)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                  {locale === 'es' ? 'Detalle de lo Solicitado *' : 'Request Detail *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder={locale === 'es' ? 'Ej. 25 copias de folleto de español, 3 cuadernos de dibujo' : 'e.g., 25 copies of Spanish booklet, 3 drawing notebooks'}
                  className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                    {locale === 'es' ? 'Cantidad de Hojas' : 'Page / Copy Count'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cantidadHojas}
                    onChange={(e) => setCantidadHojas(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-dato text-sm focus:border-montana focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                    {locale === 'es' ? 'Lugar de Retiro' : 'Pickup Location'}
                  </label>
                  <input
                    type="text"
                    value={lugarRetiro}
                    onChange={(e) => setLugarRetiro(e.target.value)}
                    placeholder="Auditorio"
                    className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-sm border border-cosecha/30 bg-cosecha/5 p-4 space-y-3">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-cosecha">
                  {locale === 'es' ? 'Trazabilidad y Estado' : 'Traceability and Status'}
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                      {locale === 'es' ? 'Estado Actual *' : 'Current Status *'}
                    </label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as typeof estado)}
                      className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm font-semibold focus:border-montana focus:outline-none"
                    >
                      <option value="recibida">📥 Recibida</option>
                      <option value="en_preparacion">⚙️ En preparación</option>
                      <option value="lista_para_retirar">🟢 Lista para retirar (Auditorio)</option>
                      <option value="entregada">✅ Entregada</option>
                      <option value="cancelada">❌ Cancelada</option>
                    </select>
                  </div>

                  {estado === 'entregada' && (
                    <div>
                      <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                        {locale === 'es' ? 'Retirado por (en Auditorio)' : 'Picked up by (at Auditorium)'}
                      </label>
                      <input
                        type="text"
                        value={recibidoPor}
                        onChange={(e) => setRecibidoPor(e.target.value)}
                        placeholder={locale === 'es' ? 'Nombre de quien retiró' : 'Name of person picking up'}
                        className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-wider text-piedra">
                    {locale === 'es' ? 'Observaciones / Notas internas' : 'Internal Notes / Observations'}
                  </label>
                  <textarea
                    rows={2}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder={locale === 'es' ? 'Notas internas de seguimiento' : 'Internal follow-up notes'}
                    className="w-full rounded-sm border border-piedra/30 px-3 py-1.5 font-lectura text-sm focus:border-montana focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="rounded-sm border border-piedra/30 px-4 py-2 font-dato text-xs uppercase tracking-wider text-tinta hover:bg-niebla"
                >
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-sm bg-montana px-6 py-2 font-dato text-xs font-bold uppercase tracking-wider text-niebla hover:bg-montana/90 disabled:opacity-50"
                >
                  {cargando
                    ? (locale === 'es' ? 'Guardando...' : 'Saving...')
                    : (esEdicion ? (locale === 'es' ? 'Guardar Cambios' : 'Save Changes') : (locale === 'es' ? 'Registrar Solicitud' : 'Register Request'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
