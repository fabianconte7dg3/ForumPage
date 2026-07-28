import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Forum Foundation — plataforma de transparencia, evidencia y servicio educativo en Coclé norte, Panamá.',
  title: 'Forum Foundation',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
