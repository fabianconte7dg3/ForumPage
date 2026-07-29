// Carga los datos ficticios de docs/fase-0/plantillas/ vía la API local de
// Payload. Idempotente: si el registro ya existe (por `nombre`), lo salta.
// Uso: pnpm seed (carga .env vía --env-file, antes de que los imports ESM
// evalúen payload.config.ts — por eso no se usa process.loadEnvFile() aquí).
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { parseCsv } from './lib/csv'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const plantillasDir = path.resolve(dirname, '../docs/fase-0/plantillas')

function readCsv(filename: string): Record<string, string>[] {
  return parseCsv(fs.readFileSync(path.join(plantillasDir, filename), 'utf8'))
}

const si = (v: string) => v.trim().toLowerCase() === 'si'
const num = (v: string) => (v ? Number(v) : undefined)

const lexicalParrafo = (texto: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: texto, version: 1 }],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
})

type Coleccion = 'programas' | 'comunidades' | 'sedes' | 'centros-educativos' | 'proyectos' | 'actividades'

async function crearSiNoExiste(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: Coleccion,
  identificador: string,
  data: Record<string, unknown>,
  campo: 'nombre' | 'titulo' = 'nombre',
) {
  const existente = await payload.find({ collection, where: { [campo]: { equals: identificador } }, limit: 1 })
  if (existente.docs.length > 0) {
    console.log(`  = ${collection}/${identificador} ya existe, se omite`)
    return existente.docs[0]
  }
  // El script arma `data` genéricamente desde CSV/fixtures — any es correcto
  // aquí, no en el resto de la app, que sí usa los tipos generados de Payload.
  const creado = await payload.create({ collection, data } as any)
  console.log(`  + ${collection}/${identificador} creado`)
  return creado
}

async function main() {
  const payload = await getPayload({ config })

  console.log('Programas:')
  const programaPorNombre = new Map<string, number>()
  for (const row of readCsv('programas.csv')) {
    const doc = await crearSiNoExiste(payload, 'programas', row.nombre, {
      nombre: row.nombre,
      descripcion: row.descripcion_breve,
      color: row.color_hex_sugerido,
      icono: row.icono_sugerido,
      activo: si(row['activo(si/no)']),
    })
    programaPorNombre.set(row.nombre, doc.id as number)
  }

  console.log('Comunidades:')
  const comunidadPorNombre = new Map<string, number>()
  for (const row of readCsv('comunidades.csv')) {
    const doc = await crearSiNoExiste(payload, 'comunidades', row.nombre, {
      nombre: row.nombre,
      distrito: row.distrito,
      corregimiento: row.corregimiento,
      coordenadas: { lat: num(row.latitud), lng: num(row.longitud) },
      descripcion: row.descripcion_breve,
    })
    comunidadPorNombre.set(row.nombre, doc.id as number)
  }

  console.log('Sedes:')
  for (const row of readCsv('sedes.csv')) {
    await crearSiNoExiste(payload, 'sedes', row.nombre, {
      nombre: row.nombre,
      tipo: row['tipo(sede_principal/biblioteca/centro)'],
      comunidad: comunidadPorNombre.get(row.comunidad),
      coordenadas: { lat: num(row.latitud), lng: num(row.longitud) },
      destacada: si(row['destacada(si/no)']),
      horario: row.horario,
    })
  }

  console.log('Centros educativos:')
  for (const row of readCsv('centros-educativos.csv')) {
    await crearSiNoExiste(payload, 'centros-educativos', row.nombre, {
      nombre: row.nombre,
      comunidad: comunidadPorNombre.get(row.comunidad),
      coordenadas: { lat: num(row.latitud), lng: num(row.longitud) },
      niveles_atendidos: row.niveles_atendidos,
      matricula_aproximada: num(row.matricula_aproximada),
      contacto: row.contacto,
    })
  }

  console.log('Proyectos:')
  const proyectos = [
    {
      titulo: 'Techado del comedor escolar de El Caimito',
      comunidad: 'El Caimito',
      programa: 'Infraestructura',
      estado: 'completado',
      avance: 100,
      monto: 4500,
    },
    {
      titulo: 'Laboratorio de cómputo en Chiguirí Arriba',
      comunidad: 'Chiguirí Arriba',
      programa: 'INADEH',
      estado: 'en_ejecucion',
      avance: 60,
      monto: 8200,
    },
    {
      titulo: 'Ampliación de la Biblioteca John Y. Keffer',
      comunidad: 'El Caimito',
      programa: 'Biblioteca',
      estado: 'aprobado',
      avance: 10,
      monto: 12000,
    },
  ]
  const proyectoPorTitulo = new Map<string, number>()
  for (const p of proyectos) {
    const doc = await crearSiNoExiste(
      payload,
      'proyectos',
      p.titulo,
      {
        titulo: p.titulo,
        comunidad: comunidadPorNombre.get(p.comunidad),
        programa: programaPorNombre.get(p.programa),
        estado: p.estado,
        avance: p.avance,
        monto: p.monto,
      },
      'titulo',
    )
    proyectoPorTitulo.set(p.titulo, doc.id as number)
  }

  console.log('Actividades:')
  const actividades = [
    {
      titulo: 'Entrega del comedor escolar de El Caimito',
      comunidad: 'El Caimito',
      programa: 'Infraestructura',
      proyecto: 'Techado del comedor escolar de El Caimito',
      fecha_publicacion: '2026-03-14',
      extracto: 'La comunidad de El Caimito recibió el nuevo techado de su comedor escolar.',
      cuerpo: 'Tras tres meses de obra, el comedor escolar de El Caimito cuenta con un techo nuevo que protege a más de cien estudiantes durante la temporada de lluvias.',
      destacada: true,
    },
    {
      titulo: 'Tutorías de matemáticas en Toabré',
      comunidad: 'Toabré',
      programa: 'Tutorías',
      fecha_publicacion: '2026-04-02',
      extracto: 'Iniciaron las tutorías semanales de matemáticas para estudiantes de premedia.',
      cuerpo: 'Un grupo de quince estudiantes de premedia se reúne cada sábado en la biblioteca comunitaria de Toabré para reforzar matemáticas con apoyo de un tutor voluntario.',
    },
    {
      titulo: 'Avance del laboratorio de cómputo en Chiguirí Arriba',
      comunidad: 'Chiguirí Arriba',
      programa: 'INADEH',
      proyecto: 'Laboratorio de cómputo en Chiguirí Arriba',
      fecha_publicacion: '2026-05-20',
      extracto: 'El nuevo laboratorio de cómputo avanza al 60% de su construcción.',
      cuerpo: 'Las obras del laboratorio de cómputo en Chiguirí Arriba continúan según lo planeado, con la instalación eléctrica ya completada.',
    },
    {
      titulo: 'Visita de becarios retornados a Río Indio',
      comunidad: 'Río Indio',
      programa: 'Becas John Y. Keffer',
      fecha_publicacion: '2026-06-08',
      extracto: 'Dos becarios que estudiaron fuera de Panamá visitaron su comunidad de origen.',
      cuerpo: 'La visita incluyó una charla con estudiantes de la escuela local sobre las carreras de medicina y educación cursadas fuera del país.',
    },
    {
      titulo: 'Nuevas adquisiciones en la Biblioteca John Y. Keffer',
      comunidad: 'El Caimito',
      programa: 'Biblioteca',
      proyecto: 'Ampliación de la Biblioteca John Y. Keffer',
      fecha_publicacion: '2026-07-01',
      extracto: 'La biblioteca sumó nuevos títulos de ciencias y literatura infantil.',
      cuerpo: 'Con el apoyo de donantes, la Academia Forum incorporó decenas de nuevos títulos disponibles para toda la comunidad estudiantil.',
      destacada: true,
    },
  ]
  for (const a of actividades) {
    await crearSiNoExiste(
      payload,
      'actividades',
      a.titulo,
      {
        titulo: a.titulo,
        extracto: a.extracto,
        contenido: lexicalParrafo(a.cuerpo),
        fecha_publicacion: a.fecha_publicacion,
        comunidad: comunidadPorNombre.get(a.comunidad),
        programa: programaPorNombre.get(a.programa),
        proyecto: a.proyecto ? proyectoPorTitulo.get(a.proyecto) : undefined,
        destacada: a.destacada ?? false,
      },
      'titulo',
    )
  }

  console.log('Listo.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
