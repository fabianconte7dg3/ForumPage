import type { Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import type { Tutoria } from '@/payload-types'

export function TutoriaCard({ locale, tutoria }: { locale: Locale; tutoria: Tutoria }) {
  const materia = typeof tutoria.materia === 'object' ? tutoria.materia : undefined
  const sede = typeof tutoria.sede === 'object' ? tutoria.sede : undefined

  return (
    <div className="relative border border-piedra/25 bg-niebla p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-cosecha" />
      <p className="font-dato text-xs text-tinta/60">{formatearFecha(tutoria.fecha_hora, locale)}</p>
      <p className="mt-2 font-lectura text-base text-montana">{materia?.nombre}</p>
      {sede && <p className="mt-1 font-lectura text-sm text-tinta/70">{sede.nombre}</p>}
      {typeof tutoria.cupo === 'number' && <p className="mt-2 font-dato text-xs text-piedra">{tutoria.cupo} cupos</p>}
    </div>
  )
}
