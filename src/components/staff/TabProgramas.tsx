import { FormularioCursoModal } from '@/components/staff/FormularioCursoModal'
import { FormularioTallerModal } from '@/components/staff/FormularioTallerModal'
import { FormularioGiraModal } from '@/components/staff/FormularioGiraModal'
import { FormularioDonacionModal } from '@/components/staff/FormularioDonacionModal'
import { formatearFecha } from '@/lib/format'
import type { Curso, Taller, GiraEducativa, Donacion, Sede, CentroEducativo, Nivel } from '@/payload-types'
import type { Locale } from '@/i18n'

type ComunidadSimple = { id: number; nombre: string }

type Props = {
  locale: Locale
  cursos: Curso[]
  talleres: Taller[]
  giras: GiraEducativa[]
  donaciones: Donacion[]
  sedes: Sede[]
  escuelas: CentroEducativo[]
  niveles: Nivel[]
  comunidades: ComunidadSimple[]
}

const TIPO_INSTITUCION_LABEL: Record<Donacion['tipo_institucion'] & string, string> = {
  escuela: 'Escuela',
  universidad: 'Universidad',
  centro_salud: 'Centro de salud',
  iglesia: 'Iglesia',
  otro: 'Otro',
}

export function TabProgramas({ locale, cursos, talleres, giras, donaciones, sedes, escuelas, niveles, comunidades }: Props) {
  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Cursos</h2>
            <p className="font-lectura text-xs text-tinta/70">Cursos de estudiantes y adultos, con participación real.</p>
          </div>
          <FormularioCursoModal locale={locale} sedes={sedes} />
        </div>

        {cursos.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No hay cursos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Nombre</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Tipo</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Realizada</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Participantes</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((c) => (
                  <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={c.id}>
                    <td className="py-3 pr-4">
                      <p className="font-display text-sm font-bold text-tinta">{c.nombre}</p>
                    </td>
                    <td className="py-3 pr-4 font-lectura text-sm capitalize text-tinta">{c.tipo}</td>
                    <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">{c.realizada ? 'Sí' : 'No'}</td>
                    <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">{c.participantes ?? '—'}</td>
                    <td className="py-3 text-right">
                      <FormularioCursoModal locale={locale} curso={c} sedes={sedes} variant="secondary" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Talleres</h2>
            <p className="font-lectura text-xs text-tinta/70">Talleres de estudiantes y adultos, con participación real.</p>
          </div>
          <FormularioTallerModal locale={locale} sedes={sedes} />
        </div>

        {talleres.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No hay talleres registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Nombre</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Tipo</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Realizado</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Participantes</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {talleres.map((tal) => (
                  <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={tal.id}>
                    <td className="py-3 pr-4">
                      <p className="font-display text-sm font-bold text-tinta">{tal.nombre}</p>
                    </td>
                    <td className="py-3 pr-4 font-lectura text-sm capitalize text-tinta">{tal.tipo}</td>
                    <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">{tal.realizada ? 'Sí' : 'No'}</td>
                    <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">{tal.participantes ?? '—'}</td>
                    <td className="py-3 text-right">
                      <FormularioTallerModal locale={locale} taller={tal} sedes={sedes} variant="secondary" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Giras Educativas</h2>
            <p className="font-lectura text-xs text-tinta/70">Giras por escuela, con participación real.</p>
          </div>
          <FormularioGiraModal locale={locale} escuelas={escuelas} niveles={niveles} />
        </div>

        {giras.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No hay giras educativas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Destino</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Escuela</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Fecha</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Participantes</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {giras.map((g) => {
                  const escuela = typeof g.escuela === 'object' ? g.escuela : null
                  return (
                    <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={g.id}>
                      <td className="py-3 pr-4">
                        <p className="font-display text-sm font-bold text-tinta">{g.destino}</p>
                      </td>
                      <td className="py-3 pr-4 font-lectura text-sm text-tinta">{escuela?.nombre ?? '—'}</td>
                      <td className="hidden py-3 pr-4 font-dato text-xs text-piedra md:table-cell">
                        {g.fecha ? formatearFecha(g.fecha, locale) : '—'}
                      </td>
                      <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">{g.participantes ?? '—'}</td>
                      <td className="py-3 text-right">
                        <FormularioGiraModal locale={locale} gira={g} escuelas={escuelas} niveles={niveles} variant="secondary" />
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
            <h2 className="font-display text-lg font-bold uppercase text-montana">Donaciones</h2>
            <p className="font-lectura text-xs text-tinta/70">Donaciones entregadas a escuelas, universidades y otras instituciones.</p>
          </div>
          <FormularioDonacionModal locale={locale} comunidades={comunidades} />
        </div>

        {donaciones.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No hay donaciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Institución</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Tipo</th>
                  <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Fecha</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {donaciones.map((d) => (
                  <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={d.id}>
                    <td className="py-3 pr-4">
                      <p className="font-display text-sm font-bold text-tinta">{d.institucion}</p>
                    </td>
                    <td className="py-3 pr-4 font-lectura text-sm text-tinta">
                      {d.tipo_institucion ? TIPO_INSTITUCION_LABEL[d.tipo_institucion] : '—'}
                    </td>
                    <td className="hidden py-3 pr-4 font-dato text-xs text-piedra md:table-cell">
                      {d.fecha ? formatearFecha(d.fecha, locale) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <FormularioDonacionModal locale={locale} donacion={d} comunidades={comunidades} variant="secondary" />
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
