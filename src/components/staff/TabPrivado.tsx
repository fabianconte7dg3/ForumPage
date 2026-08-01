import { getPayload } from 'payload'

import type { Becario, Media, RegistrosAcademico } from '@/payload-types'
import { defaultLocale, type Locale } from '@/i18n'
import { NotaInternaEditor } from '@/components/staff/NotaInternaEditor'
import { BotonVerDocumento } from '@/components/staff/BotonVerDocumento'
import config from '@/payload.config'

const TEXTOS = {
  es: {
    notaTitulo: 'Evaluación Interna (Solo Staff)',
    notaDesc: 'Esta nota es confidencial. El becario nunca podrá verla. Utilízala para registrar observaciones importantes de las entrevistas o seguimiento del trabajador social.',
    documentosTitulo: 'Documentación Socioeconómica',
    documentosDesc: 'Respaldos adjuntos al expediente del becario (Recibos, encuestas, etc).',
    sinDocumento: 'No hay documento socioeconómico adjunto.',
    sinRegistro: 'Este becario no tiene registros académicos. La nota interna se escribe sobre un registro académico.',
  },
  en: {
    notaTitulo: 'Internal Evaluation (Staff Only)',
    notaDesc: 'This note is confidential. The becario will never see it. Use it to record important observations from interviews or social worker follow-ups.',
    documentosTitulo: 'Socioeconomic Documentation',
    documentosDesc: 'Backups attached to the becario record (Receipts, surveys, etc).',
    sinDocumento: 'No socioeconomic document attached.',
    sinRegistro: 'This becario has no academic records. The internal note is written on an academic record.',
  }
} as const

export async function TabPrivado({ becario, locale }: { becario: Becario; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  // nota_interna_evaluacion vive en RegistrosAcademicos (línea 206), no en
  // Becarios — ver 01-documento-de-proyecto.md §10 "Reglas a nivel de campo".
  // Traemos el registro más reciente para mostrar/editar la nota.
  const registrosRes = await payload.find({
    collection: 'registros-academicos',
    where: { becario: { equals: becario.id } },
    sort: '-createdAt',
    limit: 1,
    overrideAccess: true,
  })
  const ultimoRegistro = registrosRes.docs[0] as RegistrosAcademico | undefined

  const docUrl = becario.documentacion_socioeconomica && typeof becario.documentacion_socioeconomica === 'object' 
    ? (becario.documentacion_socioeconomica as Media).url 
    : null

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.notaTitulo}</h2>
          <p className="mt-1 font-lectura text-sm text-tinta/70">{t.notaDesc}</p>
        </div>
        
        {ultimoRegistro ? (
          <NotaInternaEditor 
            valorInicial={ultimoRegistro.nota_interna_evaluacion ?? ''} 
            locale={locale} 
            registroId={ultimoRegistro.id} 
          />
        ) : (
          <p className="font-lectura text-sm text-tinta/70">{t.sinRegistro}</p>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.documentosTitulo}</h2>
          <p className="mt-1 font-lectura text-sm text-tinta/70">{t.documentosDesc}</p>
        </div>
        
        <div className="rounded-sm border border-piedra/25 bg-white p-5">
          {docUrl ? (
            <BotonVerDocumento url={docUrl} locale={locale} />
          ) : (
            <p className="font-lectura text-sm text-tinta/70">{t.sinDocumento}</p>
          )}
        </div>
      </section>
    </div>
  )
}
