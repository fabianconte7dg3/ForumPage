'use client'

import { useState } from 'react'
import { FormularioReportarAcademico } from './FormularioReportarAcademico'

type Locale = 'es' | 'en'

const TEXTOS = {
  es: { boton: 'Subir constancia' },
  en: { boton: 'Upload proof' },
} as const

// Mismo patrón que BotonReportarHoras: componente aparte porque el modal
// necesita 'use client' y el portal es Server Component.
export function BotonReportarAcademico({ locale }: { locale: Locale }) {
  const [abierto, setAbierto] = useState(false)
  const t = TEXTOS[locale] ?? TEXTOS.es

  return (
    <>
      <button
        className="rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs uppercase tracking-widest text-white transition-colors hover:bg-montana/90"
        onClick={() => setAbierto(true)}
        type="button"
      >
        {t.boton}
      </button>

      {abierto && (
        <FormularioReportarAcademico
          locale={locale}
          onClose={() => setAbierto(false)}
        />
      )}
    </>
  )
}
