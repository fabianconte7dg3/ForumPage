import Link from 'next/link'
import { getPayload } from 'payload'

import { BotonCerrarSesion } from '@/components/BotonCerrarSesion'
import { FormularioLogin } from '@/components/FormularioLogin'
import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Becario, Configuracion } from '@/payload-types'

// El progreso de horas y el aviso de suspensión dependen de datos que
// cambian todo el tiempo (aprobaciones del staff, reactivaciones) — nunca
// estático.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    tituloLogin: 'Portal del Becario',
    descripcionLogin: 'Iniciá sesión para ver tu progreso, tus desembolsos y tu expediente.',
    soloBecarios: 'Este portal es solo para becarios. Si sos staff, directiva o administrador, entrá por el panel.',
    irAlPanel: 'Ir al panel',
    hola: 'Hola',
    cerrarSesion: 'Cerrar sesión',
    horasTitulo: 'Horas de labor social',
    horasDetalle: 'de',
    horasAprobadas: 'horas aprobadas',
    suspendidoTitulo: 'Tu beca está suspendida',
  },
  en: {
    tituloLogin: 'Becario Portal',
    descripcionLogin: 'Log in to see your progress, disbursements, and record.',
    soloBecarios: 'This portal is for becarios only. Staff, directiva, and admin should use the panel.',
    irAlPanel: 'Go to the panel',
    hola: 'Hi',
    cerrarSesion: 'Log out',
    horasTitulo: 'Community service hours',
    horasDetalle: 'of',
    horasAprobadas: 'approved hours',
    suspendidoTitulo: 'Your scholarship is suspended',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function PortalPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario) {
    return (
      <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
        <header className="mb-8 border-b border-piedra/25 pb-8">
          <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.tituloLogin}</h1>
          <p className="mt-2 font-lectura text-sm text-tinta/80">{t.descripcionLogin}</p>
        </header>
        <FormularioLogin locale={locale} />
      </div>
    )
  }

  if (usuario.rol !== 'becario') {
    return (
      <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
        <p className="font-lectura text-sm text-tinta">{t.soloBecarios}</p>
        <Link className="mt-4 inline-block rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white" href="/admin">
          {t.irAlPanel}
        </Link>
      </div>
    )
  }

  const payload = await getPayload({ config })
  const becarioId = typeof usuario.becario === 'object' ? usuario.becario?.id : usuario.becario
  const becario = becarioId ? ((await payload.findByID({ collection: 'becarios', id: becarioId, overrideAccess: true })) as Becario) : null
  const configuracion = (await payload.findGlobal({ slug: 'configuracion', overrideAccess: true })) as Configuracion

  const meta = becario?.meta_horas_personalizada ?? configuracion.meta_horas_labor_social
  const horasAprobadas = becario
    ? (
        await payload.find({
          collection: 'horas-labor-social',
          where: { becario: { equals: becario.id }, estado: { equals: 'aprobada' } },
          limit: 1000,
          overrideAccess: true,
        })
      ).docs.reduce((acc, h) => acc + h.horas, 0)
    : 0
  const progreso = meta > 0 ? Math.min(100, Math.round((horasAprobadas / meta) * 100)) : 0

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 flex items-center justify-between border-b border-piedra/25 pb-8">
        <h1 className="font-display text-2xl font-bold uppercase text-montana md:text-3xl">
          {t.hola}, {becario?.nombre ?? usuario.email}
        </h1>
        <BotonCerrarSesion locale={locale} texto={t.cerrarSesion} />
      </header>

      {becario?.estado === 'suspendido' && (
        <div className="mb-8 rounded-md border border-cosecha bg-cosecha/10 p-5">
          <p className="font-display text-sm font-bold uppercase text-cosecha">{t.suspendidoTitulo}</p>
          {becario.motivo_suspension && <p className="mt-2 font-lectura text-sm text-tinta">{becario.motivo_suspension}</p>}
          {configuracion.texto_aviso_suspension && <p className="mt-2 font-lectura text-sm text-tinta">{configuracion.texto_aviso_suspension}</p>}
        </div>
      )}

      <section>
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.horasTitulo}</h2>
        <p className="mt-1 font-dato text-xs text-tinta/70">
          {horasAprobadas} {t.horasDetalle} {meta} {t.horasAprobadas}
        </p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-piedra/15">
          <div className="h-full bg-montana transition-[width]" style={{ width: `${progreso}%` }} />
        </div>
      </section>
    </div>
  )
}
