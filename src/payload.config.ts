import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Auditoria } from './collections/Auditoria'
import { Becarios } from './collections/Becarios'
import { Comunidades } from './collections/Comunidades'
import { Sedes } from './collections/Sedes'
import { CentrosEducativos } from './collections/CentrosEducativos'
import { Programas } from './collections/Programas'
import { Proyectos } from './collections/Proyectos'
import { Necesidades } from './collections/Necesidades'
import { Actividades } from './collections/Actividades'
import { Niveles } from './collections/Niveles'
import { Materias } from './collections/Materias'
import { Recursos } from './collections/Recursos'
import { Practicas } from './collections/Practicas'
import { Tutorias } from './collections/Tutorias'
import { Cursos } from './collections/Cursos'
import { Talleres } from './collections/Talleres'
import { GirasEducativas } from './collections/GirasEducativas'
import { Donaciones } from './collections/Donaciones'
import { RegistrosAcademicos } from './collections/RegistrosAcademicos'
import { Recuperaciones } from './collections/Recuperaciones'
import { HorasLaborSocial } from './collections/HorasLaborSocial'
import { Desembolsos } from './collections/Desembolsos'
import { Equipo } from './collections/Equipo'
import { DocumentosPrivados } from './collections/DocumentosPrivados'
import { DestinosInternacionales } from './collections/DestinosInternacionales'
import { FotosBecarios } from './collections/FotosBecarios'
import { Configuracion } from './globals/Configuracion'
import { Nosotros } from './globals/Nosotros'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: './components/admin/Logo.tsx#Logo',
        Icon: './components/admin/Logo.tsx#Logo',
      },
    },
  },
  collections: [
    Users,
    Media,
    DocumentosPrivados,
    FotosBecarios,
    Auditoria,
    Becarios,
    Comunidades,
    Sedes,
    CentrosEducativos,
    Programas,
    Proyectos,
    Necesidades,
    Actividades,
    Niveles,
    Materias,
    Recursos,
    Practicas,
    Tutorias,
    Cursos,
    Talleres,
    GirasEducativas,
    Donaciones,
    RegistrosAcademicos,
    Recuperaciones,
    HorasLaborSocial,
    Desembolsos,
    Equipo,
    DestinosInternacionales,
  ],
  globals: [Configuracion, Nosotros],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Sin auto-push: en dev, Payload por defecto empuja los cambios de esquema
    // directo a la base y no deja rastro en `payload_migrations`. Así la base
    // de dev quedó meses divergida — el esquema al día pero ninguna migración
    // corrida nunca, y por lo tanto la cadena entera sin probar (tenía el
    // `down()` roto en 8 migraciones y nadie se enteró). Con `push: false` un
    // cambio de esquema obliga a `pnpm payload migrate:create` + `migrate`,
    // que es el mismo camino que producción.
    push: false,
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
