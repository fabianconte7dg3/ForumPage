'use client'

import { useState } from 'react'

// Carga diferida: el iframe de YouTube (y su JS pesado) no se pide hasta que
// el usuario hace clic — antes solo se muestra una miniatura estática.
// youtube-nocookie.com además no deja cookies de seguimiento sin reproducir.
export function VideoYoutube({ videoId, titulo }: { videoId: string; titulo: string }) {
  const [cargado, setCargado] = useState(false)

  if (cargado) {
    return (
      <iframe
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={titulo}
      />
    )
  }

  return (
    <button
      className="group relative block aspect-video w-full overflow-hidden bg-tinta"
      onClick={() => setCargado(true)}
      type="button"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={titulo} className="h-full w-full object-cover opacity-90" src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cosecha text-white transition-transform group-hover:scale-110">
          ▶
        </span>
      </span>
    </button>
  )
}
