import * as cheerio from 'cheerio'

// Extrae texto e imágenes del HTML ya renderizado por Elementor
// (`content.rendered` de la API REST de WordPress). Ver
// 03-runbook-tecnico.md §10.2 — opción A, raspado del HTML renderizado.

type NodoLexical = { type: string; children: unknown[]; direction: null; format: ''; indent: number; version: number }

function parrafoLexical(texto: string, encabezado = false): NodoLexical {
  return {
    type: encabezado ? 'heading' : 'paragraph',
    ...(encabezado ? { tag: 'h2' } : {}),
    children: [{ type: 'text', text: texto, version: 1 }],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  } as NodoLexical
}

export function extraerContenidoLexical(html: string) {
  const $ = cheerio.load(html)
  const parrafos: NodoLexical[] = []

  $('.elementor-widget-text-editor, .elementor-widget-heading').each((_, el) => {
    const esEncabezado = $(el).hasClass('elementor-widget-heading')
    const contenedor = $(el).find('.elementor-widget-container').first()
    if (esEncabezado) {
      const texto = contenedor.text().trim()
      if (texto) parrafos.push(parrafoLexical(texto, true))
      return
    }
    contenedor.find('p').each((_, p) => {
      const texto = $(p).text().trim()
      if (texto) parrafos.push(parrafoLexical(texto))
    })
  })

  if (parrafos.length === 0) return null

  return {
    root: {
      type: 'root',
      children: parrafos,
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// WordPress sirve miniaturas como `nombre-150x150.jpg`; se prefiere el
// original sin sufijo de tamaño (regla de Fase 0: resolución original).
const aResolucionOriginal = (src: string) => src.replace(/-\d+x\d+(\.\w+)$/, '$1')

export function extraerImagenes(html: string): { src: string; alt: string }[] {
  const $ = cheerio.load(html)
  const vistas = new Set<string>()
  const imagenes: { src: string; alt: string }[] = []
  $('img').each((_, img) => {
    const srcOriginal = $(img).attr('src')
    if (!srcOriginal) return
    const src = aResolucionOriginal(srcOriginal)
    if (vistas.has(src)) return
    vistas.add(src)
    imagenes.push({ src, alt: $(img).attr('alt')?.trim() ?? '' })
  })
  return imagenes
}
