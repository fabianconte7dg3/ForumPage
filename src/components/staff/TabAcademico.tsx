import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Becario, RegistrosAcademico, Recuperacion } from '@/payload-types'
import { defaultLocale, type Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import { BotonVerDocumento } from '@/components/staff/BotonVerDocumento'
import { AccionesAcademicas } from '@/components/staff/AccionesAcademicas'
import { FormularioVerificacionAcademica } from '@/components/staff/FormularioVerificacionAcademica'
import { FormularioNuevoAcademico } from '@/components/staff/FormularioNuevoAcademico'

const TEXTOS = {
  es: {
    boletinesTitulo: 'Boletines y Calificaciones',
    recuperacionesTitulo: 'Recuperaciones (Materias Pendientes)',
    sinBoletines: 'No hay registros académicos subidos aún.',
    sinRecuperaciones: 'No hay recuperaciones registradas.',
    periodo: 'Período',
    indice: 'Índice',
    materiasReprobadas: 'Materias Reprobadas',
    ninguna: 'Ninguna',
    materia: 'Materia',
    estadoVerificado: 'Verificado',
    estadoPendiente: 'Pendiente de Verificación',
  },
  en: {
    boletinesTitulo: 'Report Cards and Grades',
    recuperacionesTitulo: 'Recoveries (Pending Subjects)',
    sinBoletines: 'No academic records uploaded yet.',
    sinRecuperaciones: 'No recoveries registered.',
    periodo: 'Period',
    indice: 'GPA',
    materiasReprobadas: 'Failed Subjects',
    ninguna: 'None',
    materia: 'Subject',
    estadoVerificado: 'Verified',
    estadoPendiente: 'Pending Verification',
  }
} as const

export async function TabAcademico({ becario, locale }: { becario: Becario; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })
  
  const registros = (
    await payload.find({
      collection: 'registros-academicos',
      where: { becario: { equals: becario.id } },
      sort: '-createdAt',
      limit: 100,
      overrideAccess: true,
    })
  ).docs as RegistrosAcademico[]

  const recuperaciones = (
    await payload.find({
      collection: 'recuperaciones',
      where: { becario: { equals: becario.id } },
      sort: '-createdAt',
      limit: 100,
      overrideAccess: true,
    })
  ).docs as Recuperacion[]

  return (
    <div className="space-y-12">
      {/* SECCIÓN 1: BOLETINES */}
      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.boletinesTitulo}</h2>
          <FormularioNuevoAcademico locale={locale} becarioId={becario.id} />
        </div>
        {registros.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.sinBoletines}</p>
        ) : (
          <ul className="space-y-4">
            {registros.map((reg) => {
              const reprobadas = reg.materias_reprobadas ?? []
              const docUrl = reg.documento && typeof reg.documento === 'object' ? reg.documento.url : null
              const isPendiente = reg.estado_verificacion === 'pendiente'

              return (
                <li key={reg.id} className="rounded-sm border border-piedra/25 bg-white px-5 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-display text-lg font-bold text-tinta">{t.periodo}: {reg.periodo}</p>
                        <span className={`rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${
                          isPendiente ? 'border-piedra/25 bg-niebla text-piedra' : 'border-montana/40 bg-montana/10 text-montana'
                        }`}>
                          {isPendiente ? t.estadoPendiente : t.estadoVerificado}
                        </span>
                      </div>
                      
                      <div className="mt-3 font-lectura text-sm text-tinta">
                        <p><strong>{t.indice}:</strong> {reg.indice ?? '—'}</p>
                        <div className="mt-1">
                          <strong>{t.materiasReprobadas}:</strong>{' '}
                          {reprobadas.length > 0 ? (
                            <ul className="mt-1 list-disc pl-5 text-cosecha">
                              {reprobadas.map((m, i) => (
                                <li key={i}>{m.nombre} ({m.calificacion})</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-montana">{t.ninguna}</span>
                          )}
                        </div>
                      </div>
                      
                      <BotonVerDocumento url={docUrl} locale={locale} />
                    </div>

                    {isPendiente && (
                      <div className="mt-4 sm:mt-0">
                        <FormularioVerificacionAcademica 
                          id={reg.id} 
                          locale={locale} 
                          becarioId={becario.id} 
                        />
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* SECCIÓN 2: RECUPERACIONES */}
      <section>
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.recuperacionesTitulo}</h2>
        {recuperaciones.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.sinRecuperaciones}</p>
        ) : (
          <ul className="space-y-4">
            {recuperaciones.map((rec) => {
              const docUrl = rec.evidencia && typeof rec.evidencia === 'object' ? rec.evidencia.url : null
              const isPendiente = rec.estado === 'pendiente'

              return (
                <li key={rec.id} className="rounded-sm border border-piedra/25 bg-white px-5 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-display text-lg font-bold text-tinta">{t.materia}: {rec.materia}</p>
                        <span className={`rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${
                          isPendiente ? 'border-piedra/25 bg-niebla text-piedra' : 'border-montana/40 bg-montana/10 text-montana'
                        }`}>
                          {isPendiente ? t.estadoPendiente : t.estadoVerificado}
                        </span>
                      </div>
                      
                      <div className="mt-3 font-lectura text-sm text-tinta">
                        <p><strong>{t.periodo}:</strong> {rec.periodo ?? '—'}</p>
                        {rec.fecha && <p className="mt-1 text-xs text-piedra">Fecha de verificación: {formatearFecha(rec.fecha, locale)}</p>}
                      </div>
                      
                      <BotonVerDocumento url={docUrl} locale={locale} />
                    </div>

                    {isPendiente && (
                      <AccionesAcademicas 
                        tipo="recuperaciones" 
                        id={rec.id} 
                        locale={locale} 
                        becarioId={becario.id} 
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
