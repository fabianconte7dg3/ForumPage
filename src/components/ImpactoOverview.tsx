import Image from 'next/image'

export type ProyectoActivo = {
  id: number
  titulo: string
  comunidad: string
  avance: number
}

export type DestinoEstudio = {
  lugar: string
  instituciones: string
  cantidad: number
}

export type BecarioDestacado = {
  id: number
  nombre: string
  carrera: string
  universidad: string
  clase: string
  cita: string
  fotoUrl: string | null
  comunidad: string
  destino: string
}

export type ImpactoOverviewTextos = {
  scholarOfTheTerm: string
  classOf: string
  openHerStory: string
  scholarsSupported: string
  allFromCocle: string
  activeScholarships: string
  thisAcademicYear: string
  projectsInCocle: string
  currentlyTracked: string
  studyingInPanama: string
  outsideCocle: string
  studyingAbroad: string
  inXCountries: (n: number) => string
  projectsInFlight: string
  project: string
  community: string
  progress: string
  whereScholarsStudy: string
  place: string
  institutions: string
  scholars: string
  abroad: string
  atHome: string
}

export function ImpactoOverview({
  becario,
  stats,
  proyectos,
  destinos,
  paisesCount,
  textos: t,
  onClickAbrirMapa,
}: {
  becario: BecarioDestacado | null
  stats: {
    scholarsSupported: number
    activeScholarships: number
    projectsCocle: number
    studyingPanama: number
    studyingAbroad: number
  }
  proyectos: ProyectoActivo[]
  destinos: DestinoEstudio[]
  paisesCount: number
  textos: ImpactoOverviewTextos
  onClickAbrirMapa?: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      {becario && (
        <section className="flex flex-col md:flex-row gap-8 rounded-2xl bg-[#eaf1d5] p-8 md:p-12">
          <div className="flex flex-1 flex-col justify-center">
            <p className="mb-4 font-dato text-xs uppercase tracking-widest text-cosecha">
              {t.scholarOfTheTerm} · {becario.comunidad} → {becario.destino}
            </p>
            <h2 className="mb-6 font-display text-4xl font-bold text-tinta md:text-5xl lg:text-6xl">
              {becario.nombre}
            </h2>
            <p className="mb-8 font-lectura text-lg text-tinta/80 max-w-xl">
              {becario.carrera}, {becario.universidad}. {t.classOf} {becario.clase}. &ldquo;{becario.cita}&rdquo;
            </p>
            <div>
              <button
                onClick={onClickAbrirMapa}
                className="rounded-full bg-cosecha px-6 py-3 font-dato text-sm uppercase tracking-wider text-niebla transition-colors hover:bg-montana"
              >
                {t.openHerStory}
              </button>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full md:w-1/2 overflow-hidden rounded-xl bg-piedra/20">
            {becario.fotoUrl ? (
              <Image
                src={becario.fotoUrl}
                alt={becario.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-lectura text-sm text-tinta/50">
                Portrait placeholder · 4:3
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Row */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard title={t.scholarsSupported} value={stats.scholarsSupported} subtitle={t.allFromCocle} />
        <StatCard title={t.activeScholarships} value={stats.activeScholarships} subtitle={t.thisAcademicYear} />
        <StatCard title={t.projectsInCocle} value={stats.projectsCocle} subtitle={t.currentlyTracked} />
        <StatCard title={t.studyingInPanama} value={stats.studyingPanama} subtitle={t.outsideCocle} />
        <StatCard title={t.studyingAbroad} value={stats.studyingAbroad} subtitle={t.inXCountries(paisesCount)} />
      </section>

      {/* Tables Row */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Projects Table */}
        <div className="rounded-2xl bg-piedra/10 p-6 md:p-8">
          <h3 className="mb-6 font-dato text-xs uppercase tracking-widest text-piedra">
            {t.projectsInFlight}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-piedra/20 font-dato text-xs uppercase tracking-wider text-piedra">
                  <th className="pb-3 font-medium">{t.project}</th>
                  <th className="pb-3 font-medium">{t.community}</th>
                  <th className="pb-3 font-medium">{t.progress}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-piedra/10 font-lectura text-sm text-tinta">
                {proyectos.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 font-medium">{p.titulo}</td>
                    <td className="py-3 pr-4">{p.comunidad}</td>
                    <td className="py-3">
                      <div className="h-2 w-24 rounded-full bg-piedra/20">
                        <div className="h-2 rounded-full bg-cosecha" style={{ width: `${p.avance}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scholars Table */}
        <div className="rounded-2xl bg-piedra/10 p-6 md:p-8">
          <h3 className="mb-6 font-dato text-xs uppercase tracking-widest text-piedra">
            {t.whereScholarsStudy}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-piedra/20 font-dato text-xs uppercase tracking-wider text-piedra">
                  <th className="pb-3 font-medium">{t.place}</th>
                  <th className="pb-3 font-medium">{t.institutions}</th>
                  <th className="pb-3 text-right font-medium">{t.scholars}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-piedra/10 font-lectura text-sm text-tinta">
                {destinos.map((d, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 font-medium">{d.lugar}</td>
                    <td className="py-3 pr-4">{d.instituciones}</td>
                    <td className="py-3 text-right">{d.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
  return (
    <div className="rounded-2xl bg-piedra/10 p-6">
      <h3 className="mb-2 font-dato text-[10px] uppercase tracking-widest text-piedra md:text-xs">
        {title}
      </h3>
      <p className="mb-1 font-display text-4xl font-bold text-tinta">
        {value}
      </p>
      <p className="font-lectura text-xs text-tinta/60">
        {subtitle}
      </p>
    </div>
  )
}
