'use client'

import { useState } from 'react'
import { FormularioReportarHoras } from './FormularioReportarHoras'

type Locale = 'es' | 'en'

const TEXTOS = {
  es: { boton: 'Reportar horas' },
  en: { boton: 'Report hours' },
} as const

// Botón que abre el modal de reporte. Es un componente aparte porque el
// modal necesita 'use client' (interactividad) y el portal es Server Component.
export function BotonReportarHoras({ locale }: { locale: Locale }) {
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
        <FormularioReportarHoras
          locale={locale}
          onClose={() => setAbierto(false)}
        />
      )}
    </>
  )
}
