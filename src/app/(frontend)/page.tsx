import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <div className="content">
        <h1>Forum Foundation</h1>
        <p>
          {!user || !('email' in user)
            ? 'Esqueleto de la plataforma — Fase 1 en construcción.'
            : `Sesión activa: ${user.email}`}
        </p>
        <div className="links">
          <a className="admin" href={payloadConfig.routes.admin} rel="noopener noreferrer">
            Ir al panel de administración
          </a>
        </div>
      </div>
    </div>
  )
}
