import React from 'react'
import './admin.scss' // Inyectar CSS global al renderizar el logo

export function Logo() {
  return (
    <div className="forum-logo-container">
      <div className="forum-logo">Forum</div>
      <div className="forum-logo">Foundation</div>
      <div className="forum-logo-sub">Panel de Administración</div>
    </div>
  )
}
