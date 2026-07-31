import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Becario, Desembolso } from '@/payload-types'
import { defaultLocale, type Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import { AccionesDesembolso } from '@/components/staff/AccionesDesembolso'
import { FormularioDesembolso } from '@/components/staff/FormularioDesembolso'

const TEXTOS = {
  es: {
    titulo: 'Historial de Desembolsos',
    sinDesembolsos: 'No hay desembolsos registrados para este becario.',
    monto: 'Monto',
    fechaProgramada: 'Programado para',
    concepto: 'Concepto',
    estado: 'Estado',
  },
  en: {
    titulo: 'Disbursement History',
    sinDesembolsos: 'No disbursements registered for this becario.',
    monto: 'Amount',
    fechaProgramada: 'Scheduled for',
    concepto: 'Concept',
    estado: 'Status',
  }
} as const

export async function TabDesembolsos({ becario, locale }: { becario: Becario; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })
  
  const desembolsos = (
    await payload.find({
      collection: 'desembolsos',
      where: { becario: { equals: becario.id } },
      sort: '-fecha_programada',
      limit: 100,
      overrideAccess: true,
    })
  ).docs as Desembolso[]

  const formatCurrency = (monto: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monto)
  }

  const ESTADO_COLOR: Record<Desembolso['estado'], string> = {
    programado: 'border-piedra/25 bg-niebla text-piedra',
    retenido: 'border-cosecha bg-cosecha/10 text-cosecha',
    pagado: 'border-montana/40 bg-montana/10 text-montana',
    cancelado: 'border-tinta/20 bg-tinta/5 text-tinta/50',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.titulo}</h2>
      </div>

      <FormularioDesembolso locale={locale} becarioId={becario.id} />

      <section>
      
      {desembolsos.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.sinDesembolsos}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-piedra/25 bg-white">
          <table className="w-full text-left font-lectura text-sm text-tinta">
            <thead className="border-b border-piedra/25 bg-niebla font-dato text-xs uppercase tracking-widest text-piedra">
              <tr>
                <th className="px-5 py-3 font-normal">{t.fechaProgramada}</th>
                <th className="px-5 py-3 font-normal">{t.concepto}</th>
                <th className="px-5 py-3 font-normal">{t.monto}</th>
                <th className="px-5 py-3 font-normal">{t.estado}</th>
                <th className="px-5 py-3 font-normal text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-piedra/15">
              {desembolsos.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-niebla/50">
                  <td className="px-5 py-4 font-dato text-xs text-tinta/70 whitespace-nowrap">
                    {formatearFecha(d.fecha_programada, locale)}
                  </td>
                  <td className="px-5 py-4">{d.concepto ?? '—'}</td>
                  <td className="px-5 py-4 font-mono">{formatCurrency(d.monto)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${ESTADO_COLOR[d.estado]}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <AccionesDesembolso 
                      id={d.id} 
                      estadoActual={d.estado} 
                      locale={locale} 
                      becarioId={becario.id} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </section>
    </div>
  )
}
