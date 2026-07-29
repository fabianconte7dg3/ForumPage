# Plan y estado — Forum Foundation

> Resumen de estado vivo. La fuente completa de checklists es [02-plan-de-ejecucion.md](../02-plan-de-ejecucion.md). **Actualizar este archivo cada vez que se cierre un bloque o cambie de fase** — es lo que evita re-explicar "dónde vamos" en cada sesión nueva.

## Estado actual

**Fase:** 1 — Base pública (arrancada)
**Última actualización:** 2026-07-28

Fase 0 tiene sus entregables iniciales listos (ver abajo), pendientes de llenarse con datos reales. En paralelo arrancó Fase 1: existe un esqueleto Next.js + Payload CMS 3 + PostgreSQL corriendo en local, verificado (`/` y `/admin` responden 200). No hay droplet ni datos reales cargados todavía.

## Principios de ejecución (no negociables)

1. **El contenido va antes que las funciones lucidoras.** El Mapa de Impacto no se construye hasta que haya comunidades, actividades y becarios cargados — de lo contrario es una pantalla vacía.
2. **Lo que depende de terceros arranca el primer día.** Consentimientos de imagen, inventario de artículos, coordenadas de comunidades: dependen de personas, no de código. Si esperan a su fase, la bloquean.
3. **Cada fase termina en algo desplegado y usable.**
4. **El sitio WordPress actual no se toca hasta el final.** El cambio de DNS es un evento único, al cierre de Fase 1.

## Definición de "hecho" (aplica a toda fase/módulo)

- [ ] Funciona en español e inglés, selector conduce a la página equivalente
- [ ] Se ve y opera bien en un teléfono de gama baja
- [ ] El staff crea/edita/borra sus registros desde el panel sin ayuda
- [ ] No supera 500 KB en primera carga
- [ ] Control de acceso según la matriz de [spec.md](spec.md#control-de-acceso-iam)
- [ ] Documentado en el `README` de operaciones

## Fases

### Fase 0 — Preparación *(sin código, bloquea todo lo demás)*

Entregables ya producidos, pendientes de llenar con datos reales del staff:

- [docs/fase-0/consentimiento.md](fase-0/consentimiento.md) — borrador bilingüe del formulario de consentimiento (becario + acudiente de menor), pendiente de validación legal
- [docs/fase-0/plantillas/](fase-0/plantillas/) — CSV para comunidades, sedes, centros educativos, programas y becarios
- [docs/fase-0/entrevista-staff.md](fase-0/entrevista-staff.md) — guion de entrevista a quien publicará en el sitio
- [docs/fase-0/accesos.md](fase-0/accesos.md) — checklist vivo de cuentas y accesos

Pendiente (depende de personas, no de código):

- [ ] Inventario completo de artículos del WordPress actual
- [ ] Informes anuales y podcast descargados de Google Drive / Anchor
- [ ] Llenar las plantillas con datos reales de comunidades, sedes, centros educativos y becarios
- [ ] Validar el consentimiento con asesoría legal panameña y **empezar la recolección de firmas** — punto crítico del cronograma
- [x] Realizar la entrevista al staff y completar el resumen en [entrevista-staff.md](fase-0/entrevista-staff.md) — hallazgo clave: el sitio anterior murió porque solo el creador de WordPress tenía control, confirmando el riesgo de "mantenedor único"; volumen real ~20 actividades/mes; staff pidió campos avanzados visibles (ajustado en `04-diseno-y-sistema-visual.md §8.1`)
- [ ] Ir tachando `docs/fase-0/accesos.md` conforme existan las cuentas reales

**Criterio de cierre:** hoja de cálculo con comunidades/coordenadas + inventario de artículos + al menos un consentimiento firmado modelo.

### Fase 1 — Base pública

Infraestructura (Docker Compose, Payload, Postgres, Caddy) → colecciones base → Actividades y migración desde WordPress → sitio público (home, mural, fichas) → Mapa de Impacto → tutorías y panel de impacto → lanzamiento con redirecciones 301 y cambio de DNS.

Criterio de aceptación clave: staff publica una actividad con 3 fotos desde el teléfono en **menos de 3 minutos**, cronometrado.

**Progreso:**

- [x] **Paso A — Payload arrancando en local.** Next.js 16 + Payload 3.82.1 + `@payloadcms/db-postgres`, Postgres local vía `docker-compose.yml` (solo DB), localización ES/EN configurada (`defaultLocale: es`) antes de crear ninguna colección, GraphQL desactivado. Colecciones `Users` y `Media` mínimas (placeholder). Verificado: `pnpm install`, `pnpm dev`, `/` y `/admin` responden 200. Ver [03-runbook-tecnico.md §2–4](../03-runbook-tecnico.md).
- [x] **Paso B — Colecciones base** (Bloque 1-2 del runbook §5): `Users` con los 4 roles + `activo` (protegidos a nivel de campo contra auto-escalación), `Media` con `imageSizes`/`consentimiento_verificado`/`contiene_menores` (con validación cruzada), `Auditoria` (solo lectura directiva/admin, escritura bloqueada desde panel), global `Configuracion`, `Comunidades`/`Sedes`/`CentrosEducativos`/`Programas`. Funciones de acceso reutilizables en `src/access/`, slug compartido en `src/fields/slug.ts`. Verificado: `tsc --noEmit` limpio, Postgres sincronizó las 23 tablas esperadas (`\dt` + columnas revisadas), `pnpm seed` cargó los 20 registros ficticios de `docs/fase-0/plantillas/` de forma idempotente (segunda corrida los detecta y omite).
- [ ] **Paso C — Actividades y script de extracción de Elementor**
- [ ] Docker Compose de staging/producción (app + Caddy) — separado del compose de solo-DB usado en desarrollo
- [ ] Resto del checklist de infraestructura, colecciones, frontend y mapa: ver [03-runbook-tecnico.md](../03-runbook-tecnico.md)

> Nota de entorno: en esta máquina el dev server de Next.js con **Turbopack** produce un panic intermitente compilando el CSS del panel admin de Payload (`@payloadcms/ui`). Se fijó `next dev --webpack` en `package.json` como mitigación — ver commit correspondiente.

### Fase 2 — Centro de Aprendizaje

Biblioteca, recursos con licencia obligatoria, prácticas en sus 3 modalidades, videos de YouTube diferidos, progreso guardado en el dispositivo.

### Fase 3 — Portal del Becario

Autenticación + 2FA, expediente académico con automatismo de suspensión/reactivación, labor social, desembolsos, pipeline de Necesidades.

Detalle completo de cada fase (checklists exhaustivos): [02-plan-de-ejecucion.md](../02-plan-de-ejecucion.md)

## Orden de arranque recomendado (primeras 4 semanas de código)

1. Repositorio, Docker Compose, Payload arrancando en local
2. Colecciones base y localización ES/EN — antes de cualquier interfaz
3. Actividades y el script de extracción de Elementor
4. En paralelo, sin código: inventario de artículos, coordenadas de comunidades, arranque de consentimientos

> El Mapa de Impacto viene después. Es la recompensa, no el punto de partida.

## Métricas de éxito (post-lanzamiento)

1. Actividades publicadas por trimestre (la métrica madre — el sitio anterior murió en cero)
2. Días desde la última publicación (visible como recordatorio permanente en el panel admin)
3. Descargas/visitas del Centro de Aprendizaje por nivel
4. Asistencia a tutorías anunciadas
5. % de becarios con expediente al día
