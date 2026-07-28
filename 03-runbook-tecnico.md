# Runbook Técnico — Plataforma Forum Foundation
### Guía de construcción paso a paso · Complemento del Proyecto v1.0 y del Plan de Ejecución

> Este documento es operativo. Se sigue en orden y se marca lo hecho.
> Cada bloque termina en un **estado verificable**: si no se puede comprobar, no está hecho.

---

## Índice

0. Cuentas, accesos y secretos
1. Análisis y elección del VPS
2. Entorno de desarrollo local
3. Estructura del repositorio
4. Configuración base de Payload
5. Colecciones — orden de construcción
6. Hooks y automatismos
7. Control de acceso
8. Frontend público
9. Mapa de Impacto
10. Migración desde WordPress
11. Aprovisionamiento y endurecimiento del servidor
12. Docker Compose y Caddy
13. Respaldos y restauración
14. Despliegue continuo
15. Prelanzamiento y cambio de DNS
16. Operación y mantenimiento

---

# 0. Cuentas, accesos y secretos

**Regla que gobierna toda esta sección: nada a nombre personal.** Todas las cuentas se crean con un correo institucional de la fundación. Si mañana el mantenedor cambia, no debe haber un solo servicio atado a una cuenta privada. Este es el error más común y el más caro de revertir.

### 0.1 Correo institucional

- [ ] Crear o confirmar `tecnologia@forum-foundation.org` (o similar) como cuenta raíz de todos los servicios
- [ ] Configurar recuperación con al menos dos personas de la fundación
- [ ] Documentar quién tiene acceso

### 0.2 Gestor de contraseñas

- [ ] Crear bóveda compartida en Bitwarden (plan gratuito basta) o 1Password
- [ ] Invitar a un responsable de la fundación además del mantenedor
- [ ] Regla: **ninguna credencial vive fuera de la bóveda**, ni en notas, ni en el repositorio, ni en un chat

### 0.3 Servicios a dar de alta

| Servicio | Para qué | Notas |
|---|---|---|
| GitHub | Repositorio y CI | Organización, no cuenta personal. Repositorio privado |
| DigitalOcean | Droplet + Spaces | A nombre de la fundación, con método de pago propio |
| Cloudflare | DNS y protección | Opcional pero recomendado; capa gratuita suficiente |
| MapTiler o Protomaps | Teselas del mapa | MapTiler tiene capa gratuita; Protomaps permite autoalojar |
| Resend o Postmark | Correo transaccional | Recuperación de contraseña e invitaciones |
| YouTube | Videos del Centro de Aprendizaje | Canal de marca ligado al correo institucional |
| Plausible o Umami | Analítica | Umami se puede autoalojar en el mismo droplet |

- [ ] Activar 2FA en **todas** las cuentas anteriores
- [ ] Guardar los códigos de recuperación en la bóveda compartida

### 0.4 Acceso a lo existente

- [ ] Usuario administrador del WordPress actual
- [ ] Acceso al panel del hosting actual (cPanel, SFTP o el que sea)
- [ ] Acceso al registrador del dominio `forum-foundation.org`
- [ ] Confirmar dónde están apuntando hoy los nameservers
- [ ] Acceso a la carpeta de Google Drive con los informes anuales
- [ ] Acceso a la cuenta de Anchor/Spotify del podcast

### 0.5 Inventario de secretos del proyecto

Todos se generan ahora y se guardan en la bóveda:

```text
PAYLOAD_SECRET            # 32+ caracteres aleatorios. NO cambia nunca entre despliegues
DATABASE_URI              # postgresql://usuario:clave@host:5432/forum
POSTGRES_USER
POSTGRES_PASSWORD
S3_ENDPOINT               # https://nyc3.digitaloceanspaces.com
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_REGION
NEXT_PUBLIC_SERVER_URL
SMTP_/RESEND_API_KEY
MAPTILER_KEY
CRON_SECRET               # protege el endpoint de regeneración de GeoJSON
```

> `PAYLOAD_SECRET` firma tokens y cookies. Si cambia entre despliegues, se cierran todas las sesiones. Se genera una vez y se guarda.

**Estado verificable de la sección 0:** existe una bóveda compartida con todas las credenciales, la fundación tiene acceso, y ninguna cuenta está a nombre personal.

---

# 1. Análisis y elección del VPS

### 1.1 Qué tiene que soportar la máquina

| Proceso | Consumo aproximado |
|---|---|
| Next.js + Payload en producción | 400–700 MB RAM |
| PostgreSQL con este volumen de datos | 200–400 MB RAM |
| Caddy | ~30 MB |
| **Build de Next.js con Payload** | **1.5–3 GB RAM en el pico** |

El problema no es servir, es **compilar**. Payload con Next.js es intensivo en memoria durante el build, especialmente con muchas colecciones y plugins, y este proyecto tiene más de veinte. En una máquina de 4 GB con Postgres corriendo al lado, un `next build` puede morir por falta de memoria.

### 1.2 Tres formas de resolverlo

**Opción A — Droplet 4 GB + swap + build en el servidor.** $24/mes. Se agregan 4 GB de swap y se limita el heap de Node. Funciona, pero cada despliegue deja el sitio lento unos minutos.

**Opción B — Droplet 4 GB + build en GitHub Actions.** $24/mes. El servidor nunca compila: recibe una imagen Docker ya construida y solo la levanta. **Es la opción recomendada.** El despliegue baja a segundos y elimina el riesgo de OOM.

**Opción C — Droplet 8 GB.** $48/mes. Resuelve el problema tirándole dinero. Innecesario si se hace B.

### 1.3 Configuración elegida

```text
Droplet:      Basic Regular, 2 vCPU / 4 GB / 80 GB SSD    $24/mes
Región:       NYC3  (menor latencia hacia Panamá que Europa)
Imagen:       Ubuntu 24.04 LTS
Swap:         4 GB (red de seguridad)
Spaces:       250 GB + CDN incluido                        $5/mes
Backups:      snapshots semanales de DigitalOcean          ~$5/mes
```

- [ ] Región NYC3 confirmada (verificar latencia real desde Panamá con `ping`)
- [ ] Monitoreo de DigitalOcean activado — es gratis
- [ ] Alerta configurada: uso de disco > 80%, RAM > 90%

### 1.4 Sobre Postgres administrado

$15/mes adicionales dan respaldos automáticos y recuperación a un punto en el tiempo. **Recomendación:** empezar con Postgres en el droplet vía Docker, con `pg_dump` diario a Spaces y restauraciones probadas. Si la operación crece o el mantenimiento manual se vuelve una carga, migrar a administrado es trivial: solo cambia `DATABASE_URI`.

**Estado verificable de la sección 1:** droplet creado, accesible por SSH con llave, con swap activo y monitoreo encendido.

---

# 2. Entorno de desarrollo local

### 2.1 Requisitos

- [ ] Node.js 22 LTS (Payload 3 requiere ≥20.9)
- [ ] pnpm — más rápido y más estricto con dependencias que npm
- [ ] Docker Desktop o Docker Engine
- [ ] Git configurado con el correo institucional

### 2.2 Crear el proyecto

```bash
pnpm create payload-app@latest forum-foundation
# Template:  blank
# Database:  PostgreSQL
cd forum-foundation
```

Esto crea un proyecto Next.js con Payload preconfigurado.

### 2.3 Postgres local en Docker

```bash
docker run --name forum-pg \
  -e POSTGRES_PASSWORD=devlocal \
  -e POSTGRES_DB=forum \
  -p 5432:5432 -d postgres:16-alpine
```

### 2.4 Variables de entorno

```bash
cp .env.example .env
```

```text
DATABASE_URI=postgresql://postgres:devlocal@localhost:5432/forum
PAYLOAD_SECRET=<generar con: openssl rand -base64 32>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 2.5 Arrancar y crear el primer usuario

```bash
pnpm dev
# Panel en http://localhost:3000/admin
```

- [ ] Panel accesible
- [ ] Primer usuario administrador creado
- [ ] Se ven las tablas en Postgres

**Estado verificable de la sección 2:** panel de Payload funcionando en local contra Postgres.

---

# 3. Estructura del repositorio

```text
forum-foundation/
├── src/
│   ├── app/
│   │   ├── (payload)/            # Panel admin y API — lo genera Payload
│   │   └── (frontend)/
│   │       └── [locale]/         # es | en
│   │           ├── page.tsx
│   │           ├── nosotros/
│   │           ├── impacto/
│   │           ├── aprende/
│   │           ├── historias/
│   │           └── portal/
│   ├── collections/
│   │   ├── base/                 # Media, Comunidades, Programas, Sedes...
│   │   ├── contenido/            # Actividades, Proyectos, Necesidades
│   │   ├── aprendizaje/          # Recursos, Practicas, Tutorias
│   │   └── becarios/             # Becarios, RegistrosAcademicos...
│   ├── globals/
│   │   └── Configuracion.ts
│   ├── access/                   # Funciones de control de acceso reutilizables
│   ├── hooks/                    # Automatismos y auditoría
│   ├── fields/                   # Campos compartidos (slug, coordenadas...)
│   ├── components/
│   ├── lib/
│   └── payload.config.ts
├── scripts/
│   ├── migrate-wordpress.ts
│   ├── build-geojson.ts
│   └── seed.ts
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── Caddyfile
├── docs/
│   ├── README-operaciones.md     # ENTREGABLE OBLIGATORIO
│   ├── runbook-restauracion.md
│   └── manual-staff.md
└── .github/workflows/deploy.yml
```

- [ ] Repositorio creado en la organización de GitHub, privado
- [ ] `.gitignore` incluye `.env`, `.next`, `node_modules`, `media/`
- [ ] `README-operaciones.md` creado **en el primer commit**, aunque esté vacío
- [ ] Rama `main` protegida

---

# 4. Configuración base de Payload

### 4.1 Paquetes

```bash
pnpm add @payloadcms/db-postgres \
         @payloadcms/richtext-lexical \
         @payloadcms/storage-s3 \
         @payloadcms/plugin-seo \
         @payloadcms/plugin-redirects \
         sharp
```

> `@payloadcms/plugin-redirects` administra las 301 desde el panel: el staff puede corregir un enlace roto sin tocar código.

### 4.2 Localización — se configura ANTES de crear colecciones

```ts
// payload.config.ts
localization: {
  locales: [
    { label: 'Español', code: 'es' },
    { label: 'English',  code: 'en' },
  ],
  defaultLocale: 'es',
  fallback: true,
}
```

> **Crítico.** Agregar localización después obliga a migrar todas las columnas de texto a tablas localizadas. Se hace ahora o se paga muy caro.

### 4.3 Adaptador de base de datos

```ts
db: postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URI },
})
```

Gestiona automáticamente los cambios de esquema en modo desarrollo y expone controles de migración para mantener sincronizados otros entornos. En producción se usan migraciones explícitas: `pnpm payload migrate:create` y `pnpm payload migrate`.

### 4.4 Almacenamiento en DigitalOcean Spaces

Spaces es compatible con S3, así que se usa el adaptador estándar:

```ts
plugins: [
  s3Storage({
    collections: { media: true },
    bucket: process.env.S3_BUCKET,
    config: {
      endpoint: process.env.S3_ENDPOINT,   // https://nyc3.digitaloceanspaces.com
      region: process.env.S3_REGION,
      forcePathStyle: false,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    },
  }),
]
```

> Esto se configura **antes de subir la primera imagen**. Si se suben archivos al disco local primero, hay que migrarlos a mano después.

- [ ] Bucket creado con CDN activado
- [ ] CORS del bucket permitiendo el dominio del sitio
- [ ] Subida de prueba verificada: el archivo aparece en Spaces, no en disco

### 4.5 2FA

Payload no trae 2FA en el núcleo. Se resuelve con `@clocklimited/payload-2fa`, que soporta TOTP y permite forzar la configuración a todos los usuarios.

- [ ] Plugin instalado y probado con una app autenticadora **en Fase 1**, no en Fase 3
- [ ] Definido el procedimiento si un miembro del staff pierde el teléfono

---

# 5. Colecciones — orden de construcción

**No se altera este orden.** Cada bloque depende del anterior.

### Bloque 1 — Fundacionales

- [ ] `Users` — roles `admin | staff | directiva | becario`, campo `becario` (relación, solo rol becario), `activo`
- [ ] `Media` — subida con `imageSizes` (thumbnail 400, card 800, hero 1600, og 1200×630), `alt` localizado y **obligatorio**, `consentimiento_verificado`, `contiene_menores`
- [ ] `Auditoria` — `actor`, `accion`, `coleccion`, `documento_id`, `valor_anterior`, `valor_nuevo`, `fecha`, `ip`. Acceso: `create: false, update: false, delete: false` desde el panel; solo se escribe por hook
- [ ] Global `Configuracion` — `meta_horas_labor_social`, `calificaciones_reprobatorias`, `texto_aviso_suspension`, contacto institucional

### Bloque 2 — Geográficas

- [ ] `Comunidades` — nombre, slug, distrito, corregimiento, `coordenadas` (point), descripción (localizada), foto
- [ ] `Sedes` — nombre, tipo, comunidad (relación), coordenadas, `destacada`, horario, fotos
- [ ] `CentrosEducativos` — nombre, comunidad, coordenadas, niveles, matrícula, contacto
- [ ] `Programas` — nombre (localizado), descripción, `color` (hex), `icono`, `activo`

> El campo `coordenadas` conviene como grupo `{ lat, lng }` con validación de rango, más simple de editar en el panel que un tipo geoespacial.

### Bloque 3 — Contenido

- [ ] `Actividades` — título, slug, extracto, contenido (Lexical), `fecha_publicacion`, portada, galería, comunidad, programa, proyecto, `destacada`
- [ ] `Proyectos` — título, programa, comunidad, centro educativo, `estado`, fechas, monto, `avance` (0–100), `foto_antes`, `foto_despues`
- [ ] `Necesidades` — título, comunidad, solicitante, descripción, prioridad, costo estimado, `estado`, `proyecto_resultante`, `visible_publicamente`

### Bloque 4 — Aprendizaje

- [ ] `Niveles`, `Materias` — taxonomías simples
- [ ] `Recursos` — título, `tipo`, nivel, materia, idioma, archivo o URL, **`fuente_y_licencia` con `required: true`**
- [ ] `Practicas` — título, nivel, materia, `modalidad`, array de preguntas
- [ ] `Tutorias` — materia, nivel, sede, fecha y hora, cupo, responsable, recurrencia, notas

### Bloque 5 — Becarios

- [ ] `Becarios`
- [ ] `RegistrosAcademicos`
- [ ] `Recuperaciones`
- [ ] `HorasLaborSocial`
- [ ] `Desembolsos`

### Reglas transversales

- [ ] Cada colección tiene `admin.useAsTitle` y `admin.defaultColumns` configurados
- [ ] Cada colección tiene `access` declarado explícitamente. **Nunca dejar el valor por defecto**
- [ ] Los campos de texto visibles al público llevan `localized: true`
- [ ] Nombres, fechas, montos y coordenadas **no** llevan `localized`
- [ ] Slugs generados por hook `beforeValidate`, editables pero estables

**Estado verificable de la sección 5:** el staff puede crear una comunidad, un programa y una actividad desde el panel, en ambos idiomas, sin ayuda.

---

# 6. Hooks y automatismos

### 6.1 Suspensión automática

`RegistrosAcademicos` → hook `afterChange`:

```text
si (doc.estado_verificacion === 'verificado'
    && doc.materias_reprobadas.length > 0
    && cambió respecto al valor previo):
      → Becarios[doc.becario].estado = 'suspendido'
      → .motivo_suspension = generado desde materias_reprobadas
      → .fecha_suspension = ahora
      → Desembolsos donde becario = X y estado = 'programado'
            → estado = 'retenido'
      → Auditoria.create({...})
```

### 6.2 Reactivación

`Recuperaciones` → hook `afterChange`:

```text
si (doc.estado === 'verificado'):
      → si no quedan materias reprobadas pendientes:
            Becarios[X].estado = 'activo'
            .motivo_suspension = null
            Desembolsos 'retenido' → 'programado'
      → Auditoria.create({...})
```

- [ ] Probado el caso de **dos materias reprobadas**: recuperar una no debe reactivar
- [ ] Probado que re-guardar un registro ya verificado no dispara el hook otra vez
- [ ] Probado que la operación es transaccional: si falla a mitad, no queda estado inconsistente

### 6.3 Auditoría

Hook global `afterChange` sobre las colecciones sensibles: `Becarios`, `RegistrosAcademicos`, `Recuperaciones`, `HorasLaborSocial`, `Desembolsos`, `Users`.

### 6.4 Regeneración de GeoJSON

Hook `afterChange` en `Comunidades`, `Sedes`, `CentrosEducativos`, `Proyectos` y `Becarios` que invalida la caché y dispara la reconstrucción del GeoJSON estático.

### 6.5 Validaciones

- [ ] `mostrar_en_mapa` no se puede activar si `consentimiento_firmado` está vacío — validación a nivel de campo, no solo advertencia visual
- [ ] `Media.contiene_menores = true` exige `consentimiento_verificado = true` para publicar
- [ ] `Recursos.fuente_y_licencia` obligatorio
- [ ] Coordenadas dentro de rangos plausibles

---

# 7. Control de acceso

### 7.1 Funciones reutilizables

En `src/access/`:

```text
esAdmin(req)
esStaffOSuperior(req)
esDirectivaOSuperior(req)
esPropioBecario(req, doc)
soloPendientes(req, doc)
publicoOAutenticado(req)
```

### 7.2 Aplicación por colección

Se implementa la matriz de la sección 10 del documento de proyecto. Puntos que exigen cuidado:

- **`Becarios.read` público** debe filtrar por `mostrar_en_mapa: true` **y** devolver solo los campos publicables. No basta con filtrar documentos: hay que restringir campos.
- **`RegistrosAcademicos`** — el becario lee y crea los propios; solo edita mientras `estado_verificacion === 'pendiente'`.
- **Campos con acceso propio:** `nota_interna_evaluacion` (staff y admin), documentación socioeconómica (staff y admin), `motivo_suspension` (visible al becario).

### 7.3 Verificación obligatoria

La API REST y GraphQL de Payload exponen todo lo que el acceso permita. **Probar contra la API, no contra la interfaz.**

- [ ] `GET /api/becarios` sin sesión → solo documentos con `mostrar_en_mapa`, sin campos privados
- [ ] `GET /api/registros-academicos` sin sesión → vacío o 403
- [ ] Becario A autenticado consultando registros de B → vacío
- [ ] Becario intentando `PATCH` sobre un registro ya verificado → rechazado
- [ ] Directiva intentando cualquier escritura → rechazado
- [ ] `GET /api/auditoria` como staff → rechazado
- [ ] Considerar desactivar GraphQL si no se usa: menos superficie

---

# 8. Frontend público

### 8.1 Enrutamiento e idioma

- [ ] `src/app/(frontend)/[locale]/` con `generateStaticParams` para `es` y `en`
- [ ] Middleware que redirige `/` a `/es` según cabecera `Accept-Language`, con `/es` por defecto
- [ ] Componente de cambio de idioma que **preserva la ruta actual** resolviendo el slug equivalente del documento
- [ ] `hreflang` recíproco en cada página

### 8.2 Presupuesto de rendimiento

- [ ] `@next/bundle-analyzer` instalado desde el inicio
- [ ] MapLibre, Recharts y cualquier librería pesada con `dynamic(() => import(...), { ssr: false })`
- [ ] Fuentes vía `next/font`, subconjunto latino, `display: swap`
- [ ] Todas las imágenes por `next/image` apuntando al CDN de Spaces
- [ ] **Falla la build si el bundle inicial supera 500 KB** — regla en CI, no una buena intención

### 8.3 Páginas

- [ ] Home con los seis bloques
- [ ] Mural con filtros por comunidad y programa, paginación, y `fecha` visible en cada tarjeta
- [ ] Artículo individual con galería
- [ ] Ficha de comunidad
- [ ] Ficha de proyecto con deslizador antes/después
- [ ] Institucionales, informes anuales, contacto
- [ ] 404 útil con enlaces a las secciones principales

---

# 9. Mapa de Impacto

### 9.1 GeoJSON precalculado

`scripts/build-geojson.ts` genera tres archivos estáticos:

```text
/public/geo/sedes.json
/public/geo/proyectos.json
/public/geo/becarios.json     # solo mostrar_en_mapa === true
```

Regenerados por hook al publicar y por un endpoint protegido con `CRON_SECRET`.

> El script **debe** aplicar el filtro de consentimiento en su origen. Si el GeoJSON contiene datos que no deberían publicarse, ya se filtró demasiado tarde: es un archivo estático servido públicamente.

### 9.2 Capas

- [ ] Sedes, con la Academia Forum diferenciada por tamaño e ícono
- [ ] Centros educativos
- [ ] Proyectos coloreados por estado
- [ ] Becarios internacionales: pin en ciudad destino
- [ ] Becarios nacionales: agregados en el pin de su comunidad

### 9.3 Clustering y arcos

- [ ] `cluster: true` en la fuente GeoJSON de Coclé, con `clusterRadius` y `clusterMaxZoom` ajustados a los ~400 pines
- [ ] Arcos como geodésicas interpoladas (~50 puntos por curva) en una capa de líneas
- [ ] Por defecto, arcos agrupados por país; se expanden al filtrar o hacer clic
- [ ] Animación de trazado progresivo desde Coclé
- [ ] `prefers-reduced-motion` respetado

### 9.4 Rendimiento

- [ ] El mapa se carga solo al entrar en viewport
- [ ] Teselas en un estilo ligero
- [ ] Probado en un teléfono de gama baja real, con datos móviles

---

# 10. Migración desde WordPress

### 10.1 Extracción

- [ ] `Herramientas → Exportar → Todo el contenido` en WordPress → XML
- [ ] Descargar `wp-content/uploads` completo por SFTP
- [ ] Exportar la tabla de posts vía consulta SQL para obtener fechas reales

### 10.2 El problema de Elementor

Elementor guarda el contenido en `_elementor_data`, un JSON propietario en `wp_postmeta`. **El XML exportado no contiene el texto usable.**

Dos caminos:

**A — Raspado del HTML renderizado.** Recorrer las URLs públicas, extraer el contenido con un selector y convertirlo a Markdown. Más fiable en la práctica.

**B — Parseo de `_elementor_data`.** Recorrer el árbol JSON buscando widgets de tipo `text-editor`, `heading` e `image`. Más limpio si la estructura es consistente.

Recomendación: **A, con revisión manual artículo por artículo.** Son decenas de artículos, no miles.

### 10.3 Script de migración

```text
scripts/migrate-wordpress.ts
  1. Lee el inventario de Fase 0 (CSV: url, título, fecha, acción)
  2. Para cada artículo marcado "migrar":
       - descarga el HTML, extrae contenido
       - convierte a Lexical
       - descarga imágenes, las sube a Media con alt provisional
       - crea Actividad con locale 'en' y la fecha real
       - registra el par url_antigua → url_nueva
  3. Emite redirects.csv para el plugin de redirecciones
```

- [ ] Ejecutado primero en local contra base limpia
- [ ] Revisión manual de cada artículo migrado
- [ ] Imágenes renombradas descriptivamente y con `alt` real
- [ ] Traducción al español cargada en el locale `es`
- [ ] Redirecciones cargadas y probadas una por una

### 10.4 Verificación

- [ ] Script que recorre todas las URLs antiguas y reporta el código de respuesta
- [ ] **Cero 404.** Cualquier URL sin equivalente redirige a su sección padre, nunca al home

---

# 11. Aprovisionamiento y endurecimiento del servidor

### 11.1 Creación

- [ ] Droplet Ubuntu 24.04, 2 vCPU / 4 GB, NYC3
- [ ] Llave SSH cargada durante la creación — **nunca autenticación por contraseña**
- [ ] IP reservada (Floating IP) asignada, para poder cambiar de máquina sin tocar DNS

### 11.2 Primeros comandos

```bash
# Actualizar
apt update && apt upgrade -y

# Usuario sin privilegios
adduser deploy && usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Swap de 4 GB
fallocate -l 4G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Zona horaria
timedatectl set-timezone America/Panama
```

### 11.3 Endurecimiento

```bash
# SSH: sin root, sin contraseñas
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
```

- [ ] `ufw` activo: solo 22, 80 y 443
- [ ] `fail2ban` instalado
- [ ] `unattended-upgrades` activo para parches de seguridad
- [ ] Puerto de Postgres **no expuesto**: solo accesible dentro de la red de Docker
- [ ] Firewall de DigitalOcean como segunda capa

### 11.4 Docker

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
```

**Estado verificable de la sección 11:** `ssh deploy@ip` funciona con llave, `ssh root@ip` falla, `nmap` solo muestra 22/80/443.

---

# 12. Docker Compose y Caddy

### 12.1 Dockerfile multietapa

```dockerfile
FROM node:22-alpine AS base
# deps → build → runner
# Salida standalone de Next.js para imagen mínima
ENV NEXT_TELEMETRY_DISABLED=1
# Usuario no-root en el runner
```

- [ ] `output: 'standalone'` en `next.config.js`
- [ ] `.dockerignore` con `node_modules`, `.next`, `.git`, `.env`

### 12.2 docker-compose.yml

```yaml
services:
  app:
    image: ghcr.io/forum-foundation/plataforma:latest
    env_file: .env
    depends_on: [db]
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    # SIN puertos publicados
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    restart: unless-stopped

volumes: { pgdata: , caddy_data: }
```

### 12.3 Caddyfile

```text
forum-foundation.org, www.forum-foundation.org {
    reverse_proxy app:3000
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
    request_body { max_size 25MB }
}
```

- [ ] Probado primero en `staging.forum-foundation.org`
- [ ] Certificado emitido automáticamente
- [ ] Límite de subida suficiente para los documentos de becarios

### 12.4 Migraciones

```bash
docker compose exec app pnpm payload migrate
```

- [ ] Ejecutadas siempre **antes** de levantar la nueva versión
- [ ] Nunca `push` de esquema automático en producción

---

# 13. Respaldos y restauración

### 13.1 Script diario

```bash
#!/bin/bash
# /opt/forum/backup.sh
FECHA=$(date +%Y-%m-%d)
docker compose exec -T db pg_dump -U postgres forum | gzip > /tmp/forum-$FECHA.sql.gz
s3cmd put /tmp/forum-$FECHA.sql.gz s3://forum-backups/db/
rm /tmp/forum-$FECHA.sql.gz
# Retención: 30 diarios, 12 mensuales
```

- [ ] Cron a las 3:00 hora de Panamá
- [ ] Bucket de respaldos **separado** del de medios
- [ ] Versionado activado en el bucket de respaldos
- [ ] Notificación si el respaldo falla — un cron silencioso que dejó de correr es lo peor que puede pasar

### 13.2 Prueba de restauración

**Obligatoria antes del lanzamiento.** Documentada en `docs/runbook-restauracion.md`.

- [ ] Levantar un droplet limpio
- [ ] Clonar el repositorio, cargar `.env` desde la bóveda
- [ ] Restaurar el último `pg_dump`
- [ ] Levantar con Docker Compose
- [ ] **Verificar que el sitio funciona y las imágenes cargan desde Spaces**
- [ ] Cronometrar el proceso completo y anotarlo en el runbook
- [ ] Destruir el droplet de prueba

> Un respaldo que nunca se restauró es una hipótesis, no un respaldo.

---

# 14. Despliegue continuo

### 14.1 GitHub Actions

```text
.github/workflows/deploy.yml
  push a main →
    1. pnpm install --frozen-lockfile
    2. pnpm lint && pnpm typecheck
    3. pnpm build            ← aquí, no en el servidor
    4. verificar presupuesto de bundle (falla si > 500 KB)
    5. docker build && push a ghcr.io
    6. ssh al droplet: pull, migrate, up -d
```

- [ ] Secretos del repositorio configurados (llave SSH de despliegue, credenciales de registro)
- [ ] La llave SSH de despliegue es **exclusiva de CI**, distinta de la personal
- [ ] Despliegue a staging automático; a producción con aprobación manual
- [ ] Procedimiento de rollback documentado: `docker compose up -d` con la etiqueta anterior

---

# 15. Prelanzamiento y cambio de DNS

### 15.1 Verificación funcional

- [ ] Las tres audiencias recorridas de punta a punta: fundador, estudiante, staff
- [ ] Selector de idioma preservando contexto en todas las plantillas
- [ ] Formularios funcionando y enviando correo
- [ ] Ninguna URL antigua devuelve 404
- [ ] `sitemap.xml` y `robots.txt` con `hreflang` recíproco
- [ ] Metadatos Open Graph verificados
- [ ] Analítica registrando visitas

### 15.2 Verificación no funcional

- [ ] Lighthouse móvil ≥ 90 en rendimiento y accesibilidad
- [ ] Bundle inicial bajo 500 KB, medido
- [ ] **Prueba en conexión móvil real de Coclé**, no en simulador de red
- [ ] Contraste y navegación por teclado verificados
- [ ] Restauración de respaldo probada
- [ ] Todas las verificaciones de acceso de la sección 7.3 pasando

### 15.3 Cutover

**Una semana antes:**
- [ ] Bajar el TTL del DNS a 300 segundos
- [ ] Capacitación del staff, grabada
- [ ] Manual de publicación entregado en español

**El día:**
- [ ] Respaldo completo del WordPress actual, archivado
- [ ] Último `pg_dump` de la plataforma nueva
- [ ] Apuntar el registro A a la IP reservada
- [ ] Verificar propagación y emisión del certificado
- [ ] Recorrer la lista de redirecciones en producción
- [ ] Enviar el sitemap a Google Search Console

**Después:**
- [ ] Monitorear 404 durante 72 horas
- [ ] WordPress conservado 30 días en modo lectura
- [ ] Restaurar el TTL a un valor normal

---

# 16. Operación y mantenimiento

### 16.1 Ritmo

| Frecuencia | Tarea |
|---|---|
| Diario | Respaldo automático + verificación de que corrió |
| Semanal | Revisar logs y espacio en disco |
| Mensual | `pnpm outdated`, aplicar parches de seguridad |
| Trimestral | Revisar métricas de publicación con el staff |
| Semestral | **Prueba de restauración completa** |
| Anual | Actualización mayor de dependencias; rotación de credenciales |

### 16.2 El entregable que no es código

`docs/README-operaciones.md` debe permitir que **otra persona** levante el sistema desde cero. Sin esto, la entrega está incompleta.

- [ ] Arquitectura y diagrama de servicios
- [ ] Cómo desplegar, cómo revertir
- [ ] Cómo restaurar un respaldo, paso a paso, con tiempos medidos
- [ ] Dónde vive cada credencial
- [ ] Qué hacer si el sitio se cae: árbol de diagnóstico
- [ ] A quién contactar

### 16.3 Métrica de salud del proyecto

En el panel de administración, un indicador permanente: **días desde la última publicación**. Es la única métrica que predice si esta plataforma terminará como el WordPress que reemplazó.

---

*Runbook operativo — se actualiza conforme se ejecuta.*
