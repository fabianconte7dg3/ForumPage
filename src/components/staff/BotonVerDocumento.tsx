import { defaultLocale, type Locale } from '@/i18n'

export function BotonVerDocumento({ 
  url, 
  locale 
}: { 
  url: string | undefined | null; 
  locale: Locale 
}) {
  if (!url) return null

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1 font-dato text-xs uppercase tracking-widest text-rio hover:underline"
    >
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      {locale === 'es' ? 'Ver Documento Adjunto' : 'View Attached Document'}
    </a>
  )
}
