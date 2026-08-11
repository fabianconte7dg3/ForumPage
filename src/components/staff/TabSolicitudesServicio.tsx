'use client'

import { useState } from 'react'
import type { SolicitudServicio } from '@/payload-types'
import type { Locale } from '@/i18n'
import { FormularioSolicitudServicioModal } from './FormularioSolicitudServicioModal'

type ComunidadOption = { id: number; nombre: string }

type Props = {
  locale: Locale
  solicitudes: SolicitudServicio[]
  comunidades: ComunidadOption[]
}

const ESTADOS_CONFIG = {
  recibida: { labelEs: 'Recibida', labelEn: 'Received', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  en_preparacion: { labelEs: 'En preparación', labelEn: 'In preparation', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  lista_para_retirar: { labelEs: 'Lista en Auditorio', labelEn: 'Ready at Auditorium', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  entregada: { labelEs: 'Entregada', labelEn: 'Delivered', color: 'bg-stone-200 text-stone-800 border-stone-400' },
  cancelada: { labelEs: 'Cancelada', labelEn: 'Canceled', color: 'bg-red-100 text-red-900 border-red-300' },
}

export function TabSolicitudesServicio({ locale, solicitudes, comunidades }: Props) {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [filtroCanal, setFiltroCanal] = useState<string>('todos')

  const filtradas = solicitudes.filter((s) => {
    if (filtroEstado !== 'todos' && s.estado !== filtroEstado) return false
    if (filtroCanal !== 'todos' && s.canal !== filtroCanal) return false
    return true
  })

  const totalRecibidas = solicitudes.filter((s) => s.estado === 'recibida').length
  const totalListas = solicitudes.filter((s) => s.estado === 'lista_para_retirar').length
  const totalEntregadas = solicitudes.filter((s) => s.estado === 'entregada').length
  const totalHojas = solicitudes.reduce((acc, s) => acc + (s.cantidad_hojas ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-montana">
            {locale === 'es' ? 'Servicios de Impresiones & Compras' : 'Print & Purchasing Services'}
          </h2>
          <p className="font-lectura text-sm text-tinta/70">
            {locale === 'es'
              ? 'Trazabilidad de servicios gratuitos recibidos por Carta o WhatsApp para retiro en Auditorio.'
              : 'Traceability of free services received via Letter or WhatsApp for pickup at Auditorium.'}
          </p>
        </div>

        <div>
          <FormularioSolicitudServicioModal locale={locale} comunidades={comunidades} />
        </div>
      </div>

      {/* Tarjetas de Cifras */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-sm border border-piedra/20 bg-white p-4">
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Recibidas' : 'Received'}
          </p>
          <p className="font-dato text-2xl font-bold text-amber-700">{totalRecibidas}</p>
        </div>
        <div className="rounded-sm border border-piedra/20 bg-white p-4">
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Listas en Auditorio' : 'Ready at Auditorium'}
          </p>
          <p className="font-dato text-2xl font-bold text-emerald-700">{totalListas}</p>
        </div>
        <div className="rounded-sm border border-piedra/20 bg-white p-4">
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Entregadas' : 'Delivered'}
          </p>
          <p className="font-dato text-2xl font-bold text-montana">{totalEntregadas}</p>
        </div>
        <div className="rounded-sm border border-piedra/20 bg-white p-4">
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Total Hojas Impresas' : 'Total Pages Printed'}
          </p>
          <p className="font-dato text-2xl font-bold text-rio">{totalHojas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 rounded-sm border border-piedra/20 bg-niebla/50 p-3">
        <div className="flex items-center gap-2">
          <label className="font-dato text-xs uppercase tracking-wider text-piedra">
            {locale === 'es' ? 'Estado:' : 'Status:'}
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-sm border border-piedra/30 bg-white px-2.5 py-1 font-lectura text-xs focus:border-montana focus:outline-none"
          >
            <option value="todos">{locale === 'es' ? 'Todos los estados' : 'All statuses'}</option>
            <option value="recibida">📥 Recibidas</option>
            <option value="en_preparacion">⚙️ En preparación</option>
            <option value="lista_para_retirar">🟢 Listas en Auditorio</option>
            <option value="entregada">✅ Entregadas</option>
            <option value="cancelada">❌ Canceladas</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-dato text-xs uppercase tracking-wider text-piedra">
            {locale === 'es' ? 'Canal:' : 'Channel:'}
          </label>
          <select
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
            className="rounded-sm border border-piedra/30 bg-white px-2.5 py-1 font-lectura text-xs focus:border-montana focus:outline-none"
          >
            <option value="todos">{locale === 'es' ? 'Todos los canales' : 'All channels'}</option>
            <option value="whatsapp">📱 WhatsApp</option>
            <option value="carta">✉️ Carta Física</option>
          </select>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      {filtradas.length === 0 ? (
        <div className="rounded-sm border border-dashed border-piedra/30 p-8 text-center">
          <p className="font-lectura text-sm text-tinta/60">
            {locale === 'es'
              ? 'No hay solicitudes de servicio registradas con estos filtros.'
              : 'No service requests found matching these filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-piedra/20 bg-white shadow-xs">
          <table className="w-full text-left font-lectura text-sm">
            <thead className="border-b border-piedra/20 bg-niebla font-dato text-xs uppercase tracking-wider text-piedra">
              <tr>
                <th className="px-4 py-3">{locale === 'es' ? 'Solicitante & Origen' : 'Applicant & Origin'}</th>
                <th className="px-4 py-3">{locale === 'es' ? 'Canal & Tipo' : 'Channel & Type'}</th>
                <th className="px-4 py-3">{locale === 'es' ? 'Detalle Solicitado' : 'Request Detail'}</th>
                <th className="px-4 py-3">{locale === 'es' ? 'Estado / Trazabilidad' : 'Status / Trace'}</th>
                <th className="px-4 py-3 text-right">{locale === 'es' ? 'Acciones' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-piedra/10">
              {filtradas.map((sol) => {
                const estConfig = ESTADOS_CONFIG[sol.estado]
                const comunidadNombre = typeof sol.comunidad === 'object' ? sol.comunidad?.nombre : null
                const fechaFormat = sol.fecha_solicitud ? sol.fecha_solicitud.slice(0, 10) : ''

                return (
                  <tr key={sol.id} className="hover:bg-niebla/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-montana">{sol.solicitante}</p>
                      {comunidadNombre && (
                        <p className="font-dato text-xs text-piedra">📍 {comunidadNombre}</p>
                      )}
                      <p className="font-dato text-xs text-piedra/70">📅 {fechaFormat}</p>
                    </td>

                    <td className="px-4 py-3 space-y-1">
                      <span className="inline-block rounded-xs bg-niebla border border-piedra/20 px-2 py-0.5 font-dato text-xs font-semibold text-tinta">
                        {sol.canal === 'whatsapp' ? '📱 WhatsApp' : '✉️ Carta'}
                      </span>
                      <div>
                        <span className="inline-block rounded-xs bg-rio/10 text-rio border border-rio/20 px-2 py-0.5 font-dato text-xs font-semibold">
                          {sol.tipo_servicio === 'impresion_copia'
                            ? '🖨️ Impresiones'
                            : sol.tipo_servicio === 'materiales_compras'
                            ? '📦 Materiales'
                            : '🖨️+📦 Ambos'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-xs text-tinta">{sol.descripcion}</p>
                      {sol.cantidad_hojas && sol.cantidad_hojas > 0 && (
                        <p className="mt-1 font-dato text-xs font-bold text-rio">
                          📄 {sol.cantidad_hojas} {locale === 'es' ? 'hojas' : 'pages'}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-xs border px-2.5 py-1 font-dato text-xs font-bold uppercase tracking-wider ${estConfig.color}`}
                      >
                        {locale === 'es' ? estConfig.labelEs : estConfig.labelEn}
                      </span>
                      {sol.estado === 'entregada' && sol.recibido_por && (
                        <p className="mt-1 font-dato text-xs text-piedra">
                          👤 {locale === 'es' ? 'Retiró:' : 'Picked up:'} {sol.recibido_por}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <FormularioSolicitudServicioModal
                        locale={locale}
                        solicitud={sol}
                        comunidades={comunidades}
                        variant="secondary"
                        triggerText={locale === 'es' ? '✏ Trazabilidad' : '✏ Traceability'}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
