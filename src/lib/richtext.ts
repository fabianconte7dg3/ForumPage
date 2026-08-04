// Conversión mínima texto plano ↔ Lexical richText, para formularios del
// panel de staff que no necesitan negrita/enlaces/listas — solo párrafos
// separados por línea en blanco. Evita cargar un editor WYSIWYG completo
// para casos donde el staff solo quiere escribir y publicar rápido.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function textoAParrafos(texto: string): any {
  const parrafos = texto
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const children = (parrafos.length > 0 ? parrafos : ['']).map((parrafo) => ({
    type: 'paragraph',
    children: [{ type: 'text', text: parrafo, version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }))

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function extraerTexto(nodo: unknown): string {
  if (!nodo || typeof nodo !== 'object') return ''
  const n = nodo as { text?: string; children?: unknown[] }
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.children)) return n.children.map(extraerTexto).join('')
  return ''
}

export function parrafosATexto(valor: unknown): string {
  if (!valor || typeof valor !== 'object') return ''
  const root = (valor as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''
  return root.children
    .map((nodo) => extraerTexto(nodo))
    .filter(Boolean)
    .join('\n\n')
}
