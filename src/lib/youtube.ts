// Formatos soportados: watch?v=, youtu.be/, /embed/, /shorts/.
export function extraerIdYoutube(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null
    if (u.hostname.endsWith('youtube.com')) {
      if (u.searchParams.has('v')) return u.searchParams.get('v')
      const match = u.pathname.match(/\/(embed|shorts)\/([^/]+)/)
      if (match) return match[2]
    }
    return null
  } catch {
    return null
  }
}
