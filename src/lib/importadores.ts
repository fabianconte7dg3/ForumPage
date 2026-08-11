// Configuración compartida del importador masivo de /staff (pestaña
// "Importar"), usada tanto por el generador de plantilla como por el
// procesador de la subida. Un solo lugar define las columnas de cada
// colección — agregar una colección nueva al importador es agregar una
// entrada acá, no tocar la UI ni el Server Action de importación.

export type TipoColumna = 'texto' | 'numero' | 'fecha' | 'select' | 'relacion'

export type ColumnaImportacion = {
  clave: string
  etiqueta: string
  tipo: TipoColumna
  requerido: boolean
  opciones?: { valor: string; etiqueta: string }[]
  // Para 'relacion': contra qué colección se busca el nombre escrito por el
  // staff, y qué campo de esa colección se compara (siempre 'nombre' salvo
  // que se indique lo contrario).
  relacionA?: { coleccion: string; campoNombre?: string }
  descripcion?: string
}

export type ConfigImportacion = {
  coleccion: string
  etiqueta: string
  columnas: ColumnaImportacion[]
  // Campos fijos que todo registro importado recibe además de las columnas
  // (ej. realizada: true, porque el importador es específicamente para
  // historial de cosas que ya ocurrieron).
  valoresFijos?: Record<string, unknown>
}

export const CONFIGS_IMPORTACION: ConfigImportacion[] = [
  {
    coleccion: 'tutorias',
    etiqueta: 'Tutorías',
    valoresFijos: { realizada: true },
    columnas: [
      { clave: 'materia', etiqueta: 'Materia', tipo: 'relacion', requerido: true, relacionA: { coleccion: 'materias' } },
      { clave: 'nivel', etiqueta: 'Nivel', tipo: 'relacion', requerido: false, relacionA: { coleccion: 'niveles' } },
      { clave: 'sede', etiqueta: 'Sede', tipo: 'relacion', requerido: true, relacionA: { coleccion: 'sedes' } },
      { clave: 'fecha_hora', etiqueta: 'Fecha', tipo: 'fecha', requerido: true, descripcion: 'Formato DD/MM/AAAA' },
      { clave: 'cupo', etiqueta: 'Cupo', tipo: 'numero', requerido: false },
      { clave: 'responsable', etiqueta: 'Responsable', tipo: 'texto', requerido: false },
      {
        clave: 'recurrencia',
        etiqueta: 'Recurrencia',
        tipo: 'select',
        requerido: false,
        opciones: [
          { valor: 'ninguna', etiqueta: 'Ninguna' },
          { valor: 'semanal', etiqueta: 'Semanal' },
          { valor: 'quincenal', etiqueta: 'Quincenal' },
          { valor: 'mensual', etiqueta: 'Mensual' },
        ],
      },
      { clave: 'participantes', etiqueta: 'Participantes', tipo: 'numero', requerido: false, descripcion: 'Cantidad real de estudiantes que asistieron' },
      { clave: 'notas', etiqueta: 'Notas', tipo: 'texto', requerido: false },
    ],
  },
  {
    coleccion: 'cursos',
    etiqueta: 'Cursos',
    valoresFijos: { realizada: true },
    columnas: [
      { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      {
        clave: 'tipo',
        etiqueta: 'Tipo',
        tipo: 'select',
        requerido: true,
        opciones: [
          { valor: 'estudiantes', etiqueta: 'Estudiantes' },
          { valor: 'adultos', etiqueta: 'Adultos' },
        ],
      },
      { clave: 'sede', etiqueta: 'Sede', tipo: 'relacion', requerido: false, relacionA: { coleccion: 'sedes' } },
      { clave: 'fecha_inicio', etiqueta: 'Fecha de inicio', tipo: 'fecha', requerido: false, descripcion: 'Formato DD/MM/AAAA' },
      { clave: 'responsable', etiqueta: 'Responsable', tipo: 'texto', requerido: false },
      { clave: 'participantes', etiqueta: 'Participantes', tipo: 'numero', requerido: false, descripcion: 'Cantidad real de participantes' },
      { clave: 'notas', etiqueta: 'Notas', tipo: 'texto', requerido: false },
    ],
  },
  {
    coleccion: 'talleres',
    etiqueta: 'Talleres',
    valoresFijos: { realizada: true },
    columnas: [
      { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      {
        clave: 'tipo',
        etiqueta: 'Tipo',
        tipo: 'select',
        requerido: true,
        opciones: [
          { valor: 'estudiantes', etiqueta: 'Estudiantes' },
          { valor: 'adultos', etiqueta: 'Adultos' },
        ],
      },
      { clave: 'sede', etiqueta: 'Sede', tipo: 'relacion', requerido: false, relacionA: { coleccion: 'sedes' } },
      { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', requerido: false, descripcion: 'Formato DD/MM/AAAA' },
      { clave: 'responsable', etiqueta: 'Responsable', tipo: 'texto', requerido: false },
      { clave: 'participantes', etiqueta: 'Participantes', tipo: 'numero', requerido: false, descripcion: 'Cantidad real de participantes' },
      { clave: 'notas', etiqueta: 'Notas', tipo: 'texto', requerido: false },
    ],
  },
  {
    coleccion: 'giras-educativas',
    etiqueta: 'Giras Educativas',
    valoresFijos: { realizada: true },
    columnas: [
      { clave: 'destino', etiqueta: 'Destino', tipo: 'texto', requerido: true, descripcion: 'Ej. Biomuseo, Ruinas de Panamá Viejo' },
      { clave: 'escuela', etiqueta: 'Escuela', tipo: 'relacion', requerido: true, relacionA: { coleccion: 'centros-educativos' } },
      { clave: 'nivel', etiqueta: 'Nivel', tipo: 'relacion', requerido: false, relacionA: { coleccion: 'niveles' } },
      { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', requerido: false, descripcion: 'Formato DD/MM/AAAA' },
      { clave: 'participantes', etiqueta: 'Participantes', tipo: 'numero', requerido: false, descripcion: 'Cantidad real de estudiantes que participaron' },
      { clave: 'notas', etiqueta: 'Notas', tipo: 'texto', requerido: false },
    ],
  },
  {
    coleccion: 'donaciones',
    etiqueta: 'Donaciones',
    columnas: [
      { clave: 'institucion', etiqueta: 'Institución', tipo: 'texto', requerido: true, descripcion: 'Ej. Escuela Membrillo, U. Tecnológica de Panamá - Coclé' },
      {
        clave: 'tipo_institucion',
        etiqueta: 'Tipo de institución',
        tipo: 'select',
        requerido: false,
        opciones: [
          { valor: 'escuela', etiqueta: 'Escuela' },
          { valor: 'universidad', etiqueta: 'Universidad' },
          { valor: 'centro_salud', etiqueta: 'Centro de salud' },
          { valor: 'iglesia', etiqueta: 'Iglesia' },
          { valor: 'otro', etiqueta: 'Otro' },
        ],
      },
      { clave: 'comunidad', etiqueta: 'Comunidad', tipo: 'relacion', requerido: false, relacionA: { coleccion: 'comunidades' } },
      { clave: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', requerido: false, descripcion: 'Qué se donó' },
      { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', requerido: false, descripcion: 'Formato DD/MM/AAAA' },
    ],
  },
]

export function configDe(coleccion: string): ConfigImportacion | undefined {
  return CONFIGS_IMPORTACION.find((c) => c.coleccion === coleccion)
}

// Excel guarda fechas como número de serie desde 1899-12-30 cuando la celda
// no llega ya convertida a Date por exceljs (pasa con algunos formatos de
// exportación de Google Sheets). Y un texto "10/08/2026" tecleado a mano hay
// que leerlo como DD/MM/AAAA (formato panameño), nunca con `new Date(...)`
// directo — eso lo interpretaría como MM/DD/AAAA (formato US) y invertiría
// día y mes en cualquier fecha con el día ≤ 12.
export function parsearFechaCelda(valor: unknown): Date | null {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor
  if (typeof valor === 'number') {
    const ms = Math.round((valor - 25569) * 86400 * 1000)
    const fecha = new Date(ms)
    return Number.isNaN(fecha.getTime()) ? null : fecha
  }
  if (typeof valor === 'string') {
    const texto = valor.trim()
    const match = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (match) {
      const [, dia, mes, anio] = match
      const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia))
      return Number.isNaN(fecha.getTime()) ? null : fecha
    }
  }
  return null
}

export function normalizarNombre(valor: string): string {
  return valor.trim().toLowerCase()
}
