'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { actualizarNecesidad } from '@/actions/actualizar-necesidad'
import type { Locale } from '@/i18n'
import type { Necesidade } from '@/payload-types'

const ESTADO_OPCIONES: { value: Necesidade['estado']; label: Record<Locale, string> }[] = [
  { value: 'recibida', label: { es: 'Recibida', en: 'Received' } },
  { value: 'en_evaluacion', label: { es: 'En evaluación', en: 'Under review' } },
  { value: 'aprobada', label: { es: 'Aprobada', en: 'Approved' } },
  { value: 'en_ejecucion', label: { es: 'En ejecución', en: 'In progress' } },
  { value: 'completada', label: { es: 'Completada', en: 'Completed' } },
]

const PRIORIDAD_OPCIONES: { value: Necesidade['prioridad']; label: Record<Locale, string> }[] = [
  { value: 'alta', label: { es: 'Alta', en: 'High' } },
  { value: 'media', label: { es: 'Media', en: 'Medium' } },
  { value: 'baja', label: { es: 'Baja', en: 'Low' } },
]

const TEXTOS = {
  es: {
    proyecto: 'Proyecto resultante',
    sinProyecto: 'Sin vincular',
    visible: 'Visible públicamente',
    guardar: 'Guardar',
    guardando: 'Guardando...',
  },
  en: {
    proyecto: 'Resulting project',
    sinProyecto: 'Not linked',
    visible: 'Publicly visible',
    guardar: 'Save',
    guardando: 'Saving...',
  },
} satisfies Record<Locale, Record<string, string>>

type Props = {
  locale: Locale
  necesidad: Necesidade
  proyectos: { id: number; titulo: string }[]
}

export function AccionesNecesidad({ locale, necesidad, proyectos }: Props) {
  const router = useRouter()
  const t = TEXTOS[locale]

  const proyectoInicialId = typeof necesidad.proyecto_resultante === 'object' ? necesidad.proyecto_resultante?.id : necesidad.proyecto_resultante

  const [estado, setEstado] = useState(necesidad.estado)
  const [prioridad, setPrioridad] = useState(necesidad.prioridad)
  const [visible, setVisible] = useState(necesidad.visible_publicamente ?? false)
  const [proyectoId, setProyectoId] = useState<number | ''>(proyectoInicialId ?? '')
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const huboCambios =
    estado !== necesidad.estado ||
    prioridad !== necesidad.prioridad ||
    visible !== (necesidad.visible_publicamente ?? false) ||
    proyectoId !== (proyectoInicialId ?? '')

  const handleGuardar = async () => {
    setErrorMsg(null)
    setCargando(true)
    const res = await actualizarNecesidad({
      id: necesidad.id,
      estado,
      prioridad,
      proyectoResultanteId: proyectoId === '' ? null : proyectoId,
      visible_publicamente: visible,
      locale,
    })
    setCargando(false)
    if (res.error) {
      setErrorMsg(res.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-piedra/15 pt-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div>
        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">Estado</label>
        <select
          className="rounded-sm border border-piedra/25 bg-white px-2 py-1.5 font-lectura text-sm outline-none focus:border-montana"
          onChange={(e) => setEstado(e.target.value as Necesidade['estado'])}
          value={estado}
        >
          {ESTADO_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label[locale]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">Prioridad</label>
        <select
          className="rounded-sm border border-piedra/25 bg-white px-2 py-1.5 font-lectura text-sm outline-none focus:border-montana"
          onChange={(e) => setPrioridad(e.target.value as Necesidade['prioridad'])}
          value={prioridad}
        >
          {PRIORIDAD_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label[locale]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">{t.proyecto}</label>
        <select
          className="max-w-[14rem] rounded-sm border border-piedra/25 bg-white px-2 py-1.5 font-lectura text-sm outline-none focus:border-montana"
          onChange={(e) => setProyectoId(e.target.value ? Number(e.target.value) : '')}
          value={proyectoId}
        >
          <option value="">{t.sinProyecto}</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 pb-1.5 font-dato text-xs uppercase tracking-widest text-tinta">
        <input checked={visible} onChange={(e) => setVisible(e.target.checked)} type="checkbox" />
        {t.visible}
      </label>

      <button
        className="rounded-sm border border-montana bg-montana px-4 py-1.5 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
        disabled={!huboCambios || cargando}
        onClick={handleGuardar}
        type="button"
      >
        {cargando ? t.guardando : t.guardar}
      </button>

      {errorMsg && <p className="w-full font-lectura text-xs text-cosecha">{errorMsg}</p>}
    </div>
  )
}
