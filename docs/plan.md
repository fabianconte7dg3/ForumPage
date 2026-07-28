# Plan y estado — Forum Foundation

> Resumen de estado vivo. La fuente completa de checklists es [02-plan-de-ejecucion.md](../02-plan-de-ejecucion.md). **Actualizar este archivo cada vez que se cierre un bloque o cambie de fase** — es lo que evita re-explicar "dónde vamos" en cada sesión nueva.

## Estado actual

**Fase:** 0 — Preparación (no iniciada)
**Última actualización:** 2026-07-28

Hasta ahora existe únicamente la especificación (documentos 01–05) y el repositorio en [github.com/fabianconte7dg3/ForumPage](https://github.com/fabianconte7dg3/ForumPage). No hay código de la aplicación, no hay droplet, no hay datos cargados.

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

- [ ] Inventario completo de artículos del WordPress actual
- [ ] Informes anuales y podcast descargados de Google Drive / Anchor
- [ ] Listado y coordenadas de comunidades, sedes, centros educativos
- [ ] Padrón de becarios
- [ ] Formulario de consentimiento de imagen (bilingüe) redactado y validado contra Ley 81
- [ ] **Recolección de firmas de becarios iniciada** — punto crítico del cronograma
- [ ] Accesos: WordPress, registrador de dominio, DigitalOcean, gestor de contraseñas, YouTube

**Criterio de cierre:** hoja de cálculo con comunidades/coordenadas + inventario de artículos + al menos un consentimiento firmado modelo.

### Fase 1 — Base pública

Infraestructura (Docker Compose, Payload, Postgres, Caddy) → colecciones base → Actividades y migración desde WordPress → sitio público (home, mural, fichas) → Mapa de Impacto → tutorías y panel de impacto → lanzamiento con redirecciones 301 y cambio de DNS.

Criterio de aceptación clave: staff publica una actividad con 3 fotos desde el teléfono en **menos de 3 minutos**, cronometrado.

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
