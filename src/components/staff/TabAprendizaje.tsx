import { FormularioRecursoModal } from '@/components/staff/FormularioRecursoModal'
import { FormularioTutoriaModal } from '@/components/staff/FormularioTutoriaModal'
import { FormularioPracticaModal } from '@/components/staff/FormularioPracticaModal'
import { formatearFecha } from '@/lib/format'
import type { Recurso, Tutoria, Practica, Nivel, Materia, Sede } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  recursos: Recurso[]
  tutorias: Tutoria[]
  practicas: Practica[]
  niveles: Nivel[]
  materias: Materia[]
  sedes: Sede[]
}

const TIPO_LABEL: Record<Recurso['tipo'], string> = {
  pdf_propio: 'PDF',
  enlace_externo: 'Enlace',
  video_youtube: 'Video',
  practica: 'Práctica',
}

const MODALIDAD_LABEL: Record<Practica['modalidad'], string> = {
  descargable: 'Descargable',
  quiz_autocorregido: 'Quiz autocorregido',
  quiz_con_progreso: 'Quiz con progreso',
}

export function TabAprendizaje({ locale, recursos, tutorias, practicas, niveles, materias, sedes }: Props) {
  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Biblioteca de Recursos</h2>
            <p className="font-lectura text-xs text-tinta/70">Materiales de la Biblioteca del Centro de Aprendizaje.</p>
          </div>
          <FormularioRecursoModal locale={locale} niveles={niveles} materias={materias} />
        </div>

        {recursos.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No hay recursos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Título</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Tipo</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Nivel / Materia</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recursos.map((r) => {
                  const nivel = typeof r.nivel === 'object' ? r.nivel : null
                  const materia = typeof r.materia === 'object' ? r.materia : null
                  return (
                    <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={r.id}>
                      <td className="py-3 pr-4">
                        <p className="font-display text-sm font-bold text-tinta">{r.titulo}</p>
                      </td>
                      <td className="py-3 pr-4 font-lectura text-sm text-tinta">{TIPO_LABEL[r.tipo]}</td>
                      <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">
                        {[nivel?.nombre, materia?.nombre].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <FormularioRecursoModal
                          locale={locale}
                          recurso={r}
                          niveles={niveles}
                          materias={materias}
                          variant="secondary"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Tutorías</h2>
            <p className="font-lectura text-xs text-tinta/70">Sesiones anunciadas en /aprende/tutorias.</p>
          </div>
          <FormularioTutoriaModal locale={locale} materias={materias} niveles={niveles} sedes={sedes} />
        </div>

        {tutorias.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No hay tutorías agendadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Fecha</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Materia</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Sede</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Cupo</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {tutorias.map((tut) => {
                  const materia = typeof tut.materia === 'object' ? tut.materia : null
                  const sede = typeof tut.sede === 'object' ? tut.sede : null
                  return (
                    <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={tut.id}>
                      <td className="py-3 pr-4 font-dato text-xs text-piedra">{formatearFecha(tut.fecha_hora, locale)}</td>
                      <td className="py-3 pr-4 font-lectura text-sm font-bold text-tinta">{materia?.nombre ?? '—'}</td>
                      <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">{sede?.nombre ?? '—'}</td>
                      <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">{tut.cupo ?? '—'}</td>
                      <td className="py-3 text-right">
                        <FormularioTutoriaModal
                          locale={locale}
                          tutoria={tut}
                          materias={materias}
                          niveles={niveles}
                          sedes={sedes}
                          variant="secondary"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Prácticas</h2>
            <p className="font-lectura text-xs text-tinta/70">Quizzes y descargables en /aprende/practicas.</p>
          </div>
          <FormularioPracticaModal locale={locale} niveles={niveles} materias={materias} />
        </div>

        {practicas.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No hay prácticas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Título</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Modalidad</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Nivel / Materia</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {practicas.map((p) => {
                  const nivel = typeof p.nivel === 'object' ? p.nivel : null
                  const materia = typeof p.materia === 'object' ? p.materia : null
                  return (
                    <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={p.id}>
                      <td className="py-3 pr-4">
                        <p className="font-display text-sm font-bold text-tinta">{p.titulo}</p>
                      </td>
                      <td className="py-3 pr-4 font-lectura text-sm text-tinta">{MODALIDAD_LABEL[p.modalidad]}</td>
                      <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">
                        {[nivel?.nombre, materia?.nombre].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <FormularioPracticaModal
                          locale={locale}
                          practica={p}
                          niveles={niveles}
                          materias={materias}
                          variant="secondary"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-sm border border-piedra/25 bg-niebla/40 p-5">
        <h2 className="font-display text-sm font-bold uppercase text-montana">Otros contenidos del Centro de Aprendizaje</h2>
        <p className="mt-1 font-lectura text-xs text-tinta/70">
          Niveles y Materias son taxonomías simples (un solo campo de nombre) — se editan directo en el panel de Payload.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/admin/collections/niveles"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-montana px-3 py-1.5 font-dato text-xs uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white"
          >
            Gestionar Niveles
          </a>
          <a
            href="/admin/collections/materias"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-montana px-3 py-1.5 font-dato text-xs uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white"
          >
            Gestionar Materias
          </a>
        </div>
      </section>
    </div>
  )
}
