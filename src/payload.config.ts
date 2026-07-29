import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Auditoria } from './collections/Auditoria'
import { Comunidades } from './collections/Comunidades'
import { Sedes } from './collections/Sedes'
import { CentrosEducativos } from './collections/CentrosEducativos'
import { Programas } from './collections/Programas'
import { Proyectos } from './collections/Proyectos'
import { Actividades } from './collections/Actividades'
import { Configuracion } from './globals/Configuracion'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Auditoria, Comunidades, Sedes, CentrosEducativos, Programas, Proyectos, Actividades],
  globals: [Configuracion],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  // Localización a nivel de campo desde el día uno — ver 03-runbook-tecnico.md §4.2.
  // Agregarla después obligaría a migrar todo el esquema.
  localization: {
    locales: [
      { label: 'Español', code: 'es' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'es',
    fallback: true,
  },
  // Desactivado: no se usa en el frontend y es superficie de ataque gratis (05-ciberseguridad.md §3.8).
  graphQL: {
    disable: true,
  },
  plugins: [],
})
