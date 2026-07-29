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

- [x] Inventario completo de artículos del WordPress actual — ver [docs/fase-0/accesos.md](fase-0/accesos.md)
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
- [x] **Paso C — Actividades y script de extracción de Elementor.** Colecciones `Proyectos` (con `foto_antes`/`foto_despues`, `estado`, `avance`) y `Actividades` (mural + blog unificados). `scripts/lib/elementor.ts` extrae texto e imágenes del HTML ya renderizado de Elementor (vía la API REST pública de WordPress, no scraping de HTML crudo), probado contra el sitio real. `scripts/migrate-wordpress.ts` orquesta: lee `docs/fase-0/plantillas/inventario-articulos.csv`, migra solo filas marcadas `accion=migrar`, sube imágenes a Media, crea la Actividad en locale `en` con la comunidad placeholder "Sin clasificar" (el staff reasigna la comunidad real al revisar), y emite `redirects.csv`. **Inventario real generado**: 70 artículos extraídos en vivo de forum-foundation.org (título, URL, fecha, idioma, conteo de imágenes) — cierra ese pendiente de Fase 0. Verificado con una migración real de prueba (1 artículo, revertida después): imagen descargada, Actividad creada con fecha y contenido reales, redirects.csv correcto. **Pendiente:** el staff completa la columna `accion` del inventario (varios de los 70 posts son perfiles de becario, no actividades) antes de correr `pnpm migrate:wordpress` para el resto.
- [x] **Paso D — Colecciones de Aprendizaje** (Bloque 4 del runbook §5): `Niveles`/`Materias` (taxonomías simples), `Recursos` (`fuente_y_licencia` obligatorio, `idioma` como campo propio — no localización — y campos condicionales según `tipo`), `Practicas` (tres modalidades, preguntas anidadas con opciones y retroalimentación, también condicionales según `modalidad`), `Tutorias` (materia/nivel/sede/fecha con hora/cupo/recurrencia). Verificado: `tsc --noEmit` limpio, `pnpm seed` cargó niveles, materias, 3 recursos, 1 práctica con 2 preguntas anidadas y 2 tutorías — confirmado el array anidado de preguntas/opciones en Postgres (`practicas_preguntas_locales`, `practicas_preguntas_opciones_locales`), idempotente en segunda corrida.
- [x] **Paso E — Frontend: enrutamiento ES/EN, Home y Biblioteca.** Tailwind CSS v4 con los tokens canónicos del doc 04 (no los del mockup de referencia, que tenía drift en `montana`/`cosecha` — ver análisis en la conversación). Enrutamiento `[locale]` con `src/proxy.ts` (renombrado desde `middleware.ts`, requisito de Next 16) redirigiendo `/` según `Accept-Language`. `Header`/`Footer` bilingües con selector que preserva la ruta. Home con sus 6 bloques (doc 04 §7.1) conectado a datos reales: comunidades y proyectos completados por conteo real, 3 actividades recientes, próxima tutoría — becarios activos/países muestran "—" honestamente porque `Becarios` es Fase 3, no un número inventado. Biblioteca (`/aprende/biblioteca`) con filtros por tipo/nivel/materia vía query params y paginación, conectada a `Recursos`. Se agregó `Configuracion.fecha_actualizacion_impacto` (faltaba para el bloque de cifras). Verificado con el servidor corriendo: `/`, `/es`, `/en`, `/admin` y `/es/aprende/biblioteca` (con y sin filtro) responden 200 con datos reales, sin errores en el log.
- [x] **Paso F — Frontend: mural de Historias y artículo individual.** `/historias` con filtros por comunidad/programa vía query params, rejilla de tarjetas (componente `ActividadCard` compartido con Home) y paginación. `/historias/[slug]` con encabezado fecha/comunidad/programa, contenido renderizado con `<RichText>` de `@payloadcms/richtext-lexical/react` (el serializador oficial — nunca `dangerouslySetInnerHTML`, por 05-ciberseguridad.md §3.7), galería, y enlaces a comunidad/proyecto relacionados (apuntan a fichas que aún no existen, 404 esperado hasta construirlas). `formatearFecha` extraído a `src/lib/format.ts` para no duplicar entre páginas. Verificado con el servidor corriendo: mural muestra las 5 actividades reales con filtros poblados, el artículo real (con proyecto relacionado) renderiza su contenido Lexical correctamente, sin errores de consola ni del servidor.
- [x] **Paso G — Frontend: ficha de comunidad.** `/impacto/comunidades/[slug]` con encabezado (foto, distrito/corregimiento, descripción), lista de proyectos de la comunidad con barra de avance, y mural de sus actividades recientes (reutiliza `ActividadCard`). Cierra el enlace "Ver comunidad" del artículo individual. Verificado con el servidor corriendo: navegando desde un artículo real (El Caimito) se ven sus 2 proyectos reales con estado y avance, y sus 2 actividades reales, sin errores de consola ni del servidor.
- [x] **Paso H — Frontend: slug de Proyectos y su ficha.** Agregado `slugField('titulo')` a `Proyectos` (backfill de los 3 registros existentes vía script de un solo uso, luego borrado). `/impacto/proyectos/[slug]` con estado/avance/fechas/monto, enlaces a comunidad y programa, fotos antes/después, y actividades relacionadas. Los enlaces "Ver proyecto relacionado" (artículo) y las tarjetas de proyecto (ficha de comunidad) ahora apuntan por `slug`. Verificado con el servidor corriendo: desde el artículo real de El Caimito se llega a la ficha de "Ampliación de la Biblioteca John Y. Keffer" con su monto y actividad relacionada real, y desde la ficha de comunidad ambos proyectos enlazan a sus fichas correctas.
- [x] **Paso I — Frontend: Mapa de Impacto.** `/impacto` con MapLibre GL JS (`maplibre-gl`), datos reales de `Comunidades` y `Sedes` (grupo `coordenadas` ya existente en ambas), filtro por programa a partir de `Proyectos.programa` (une comunidad→proyectos→programa), contador sobre el mapa, popup con enlace a la ficha de comunidad al hacer clic. Carga aislada del bundle de Home vía un wrapper cliente (`ImpactoMapLoader`) con `next/dynamic({ ssr: false })` — obligatorio porque MapLibre usa WebGL/`window`, no solo por el presupuesto de 500 KB (docs/spec.md línea 34). Sin `MAPTILER_KEY` en `.env` cae a las teselas demo de MapLibre (solo contornos de país, sin calles) — con la llave real en producción usa MapTiler. **Simplificación deliberada:** el panel lateral deslizable del doc 04 §7.2 se reemplazó por el `Popup` nativo de MapLibre (más simple, ya accesible); la alternativa de listas navegables que exige el doc 04 §5 ya existe vía las fichas de comunidad (Paso G). Verificado: `tsc --noEmit` limpio, `/es/impacto` responde con datos reales (9 comunidades · 3 sedes, 5 programas como filtro), el mapa hace fetch correcto de `style.json`/`tiles.json` sin errores de consola. **Nota de verificación:** en esta sesión el pane del navegador nunca quedó "visible" para el compositor (`document.hidden` permanente), así que el renderizado WebGL en sí no pudo confirmarse pixel a pixel aquí — es una limitación del entorno de pruebas, no del código; falta confirmarlo con el servidor corriendo en un navegador real.
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
