import { Archivo, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale, locales } from '@/i18n'
import './styles.css'

// Display: Archivo en pesos anchos (600/700) — ver 04-diseno-y-sistema-visual.md §3.2.
const archivo = Archivo({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-archivo' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-source-serif' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' })

export const metadata = {
  description: 'Forum Foundation — plataforma de transparencia, evidencia y servicio educativo en Coclé norte, Panamá.',
  title: 'Forum Foundation',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  if (!isLocale(locale)) notFound()

  return (
    <html className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable}`} lang={locale}>
      <body className="flex min-h-screen flex-col font-lectura text-tinta antialiased">
        <Header locale={locale} />
        <main className="flex-grow">{props.children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  )
}
