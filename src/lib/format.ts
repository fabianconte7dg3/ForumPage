import type { Locale } from '@/i18n'

export const formatearFecha = (valor: string, locale: Locale) =>
  new Date(valor).toLocaleDateString(locale === 'es' ? 'es-PA' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
