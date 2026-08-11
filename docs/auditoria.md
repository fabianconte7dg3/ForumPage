# Auditoría exhaustiva — agosto 2026

**Disparador:** un becario recién invitado, al activar su cuenta en el VPS, quedó con acceso al panel nativo `/admin` de Payload y podía ver Publicaciones. Dos causas: `Users` no declaraba `access.admin` (Payload por defecto deja entrar a cualquier usuario autenticado) y `FormularioContrasena` tenía `href="/admin"` hardcodeado tras activar.

El bug no es interesante por sí solo. Es interesante porque **llegó a producción sin que nada lo detectara**: no hay tests, `tsc` y `eslint` pasan igual, y la verificación se hizo siempre contra la interfaz y no contra `/api/` (error #8 de `.agents/AGENTS.md`). Esta auditoría busca los hermanos de ese bug.

## Alcance

| | Cantidad |
|---|---|
| Colecciones Payload | 27 |
| Globals | 2 |
| Server actions | 45 |
| Rutas (páginas + API) | 26 |
| Sitios con `overrideAccess: true` | 32 |
| Tests existentes | **0** |

## Principio rector de la auditoría

> Se prueba contra `/api/` con una sesión real de cada rol, nunca contra la interfaz. Que el panel no muestre algo no significa que la API no lo entregue.

Cinco personas para todo: **anónimo, becario, staff, directiva, admin**.

## Fase 1 — Análisis estático (agentes en paralelo, solo lectura)

| # | Agente | Qué busca |
|---|---|---|
| A1 | Control de acceso de colecciones | Las 27 colecciones contra la matriz de `docs/spec.md`. Propiedades de `access` faltantes o mal declaradas, campos sensibles sin `access` a nivel de campo (`suspendido`, `nota_interna_evaluacion`, respuestas de quiz, `solicitante`). |
| A2 | `overrideAccess: true` | Los 32 sitios. Error #10 de AGENTS.md: cada uno tiene que reponer a mano en el `where` el filtro que `access.read` le habría aplicado a un visitante anónimo. |
| A3 | Autorización en server actions | Las 45 actions. IDOR: ¿verifican sesión y autoridad sobre el registro objetivo, o confían en el id que manda el cliente? |
| A4 | Autenticación y sesión | Hooks de `Users`, invitación, `reset-password`, 2FA, rutas `/cuenta/*`, guardas de `/portal`, `/staff`, `/directiva`. |
| A5 | Frontend, i18n y fugas de datos | Las 26 rutas por persona y por locale. Guardas faltantes, datos privados en el payload RSC, contenido hardcodeado. |
| A6 | Migraciones, hooks e integridad | `down()` roto (error #6), hooks que mutan datos, importador de Excel. |

## Fase 2 — Pruebas en runtime

Contra el servidor local con `node --test` + `tsx` (Node 26 trae el runner incorporado — sin dependencias nuevas).

- `tests/acceso.test.ts` — matriz completa de personas × colecciones × operaciones contra `/api/`, con cookies de sesión reales.
- `tests/paginas.test.ts` — GET de cada ruta por persona y locale; código de estado esperado y ausencia de cadenas que no deberían filtrarse.

Las cuentas de prueba se crean y se borran dentro del test. Nunca se prueba con cuentas reales ni contra producción.

## Fase 3 — Corrección

Hallazgos ordenados por severidad. Los críticos (exposición de datos, escalada de privilegios) se arreglan y se despliegan primero.

## Estado

- [x] **Fase 0** — Arreglo del bug disparador (`access.admin` en `Users`, redirección a `/portal`), verificado con `curl` contra `/api/` con sesión de becario: `/admin` → 307 a `/admin/unauthorized`, `/portal` → 200. Commiteado en `135511f`.
- [x] **Fase 1 — Análisis estático completo**: los 33 sitios `overrideAccess: true` restantes, las 44 server actions restantes y las 24 rutas del frontend público, revisados por agentes en paralelo (código, no runtime). Ver hallazgos abajo.
- [x] **Fase 2 — Pruebas en runtime**: tras una traba total de la máquina (no relacionada con el código — ver nota abajo) y su reinicio, `tests/acceso.test.ts` corrió contra el servidor de dev real: **88/88 aserciones pasadas** (5 personas × colecciones privadas/institucionales × operaciones, panel `/admin` por rol, escalada de privilegios, campos sensibles, consentimiento). Cuentas de prueba creadas y borradas dentro de la corrida, confirmado sin huérfanas después.
- [x] **Fase 3 — Corrección y verificación**: 3 hallazgos reales corregidos (uno ALTO, dos BAJO — ver abajo), los 3 confirmados en runtime, no solo por tipo:
  - **Fuga de identidad (ALTO)**: se revocó `mostrar_en_mapa` de un becario real de dev (Carlos Aguilar / Tokio) — su universidad y país desaparecieron de la tabla pública de `/impacto`; se repuso el consentimiento y la fila volvió a aparecer. Round-trip completo, no es un artefacto de caché.
  - **Columna "Comunidad" vacía (BAJO)**: confirmado que ahora `/impacto` renderiza los nombres reales (Río Indio, El Caimito, Chiguirí Arriba) donde antes quedaba en blanco.
  - **Cast mal tipado en `TabPrivado.tsx` (BAJO)**: confirmado por `tsc --noEmit` limpio (el guard `typeof === 'object'` ya narrowea al tipo correcto sin cast).

**Nota sobre la interrupción:** a mitad de esta auditoría la máquina se trabó por completo (ajeno al proyecto — múltiples binarios no relacionados, incluyendo Node y el propio Claude Desktop, cayeron con SIGSEGV en la misma ventana). El usuario reinició la máquina y se retomó desde ahí sin pérdida de trabajo.

### Hallazgos y correcciones (2026-08-10, sesión de auditoría exhaustiva)

**ALTO — fuga de identidad de becarios sin consentimiento, en `/impacto` (pestaña Resumen).**
`src/app/(frontend)/[locale]/impacto/page.tsx`, el mapa `destinosMap` (tabla "Dónde estudian los becarios") se construía iterando `becariosDocsActivos` sin el filtro `mostrar_en_mapa` — la misma variable que dos bloques más arriba (`becarioDestacado`, línea 303) sí lo aplica, con un comentario que cita textualmente el bug ya corregido una vez. Con `cantidad: 1` en un país, el nombre de la universidad identificaba a un becario puntual aunque hubiera revocado el consentimiento — viola la regla de `docs/spec.md` ("revocable en cualquier momento por el propio becario") y `CLAUDE.md` ("nunca... ni siquiera de forma agregada"). **Corregido**: se agregó el mismo guard `if (!b.mostrar_en_mapa) continue` al loop de `destinosMap`.

**BAJO — columna "Comunidad" vacía en la tabla de proyectos de `/impacto`.**
La misma página traía `proyectos` con `depth: 0`, así que `p.comunidad` llegaba siempre como número (id), nunca como objeto — la columna quedaba vacía siempre, en dev y en producción por igual. No es un problema de seguridad, es un dato roto silencioso. **Corregido**: `depth: 0` → `depth: 1`.

**BAJO — cast que tapaba un tipo incorrecto, `TabPrivado.tsx` (panel de staff).**
`(becario.documentacion_socioeconomica as Media).url` — el tipo real generado por Payload es `DocumentosPrivado`, no `Media` (regla ya documentada en `.agents/AGENTS.md` #3: nunca callar a `tsc` con un cast). Funcionaba por casualidad porque ambas colecciones exponen `.url`. Sin exposición pública (panel solo-staff). **Corregido**: se quitó el cast — el guard `typeof === 'object'` ya narrowea al tipo correcto sin necesidad de forzarlo.

**BAJO — `Becarios.condicion_socioeconomica_verificada` sin `access.create` a nivel de campo.**
Quedaba en el default de Payload al crear (aunque el `access.create` de la colección completa ya es staff/admin, así que no era explotable hoy). **Corregido**: agregado `create: esStaffOSuperiorFieldAccess`, igual que `update`.

**Sin hallazgos — confirmado por lectura exhaustiva de código:**
- Los otros 33 sitios con `overrideAccess: true` (server actions de cuenta propia, páginas gateadas por rol antes del fetch, colecciones ya públicas, Server Components que solo extraen campos escalares hacia JSX).
- Las 44 server actions restantes — ninguna hace `data: input` sin enumerar campos, ninguna permite IDOR sobre el id de otro usuario/becario, todas gatean el rol correcto.
- Contenido hardcodeado (error #11 de AGENTS.md) — el fix histórico de "universidades frecuentes" sigue vigente, no apareció una instancia nueva.
- Guardas de ruta de las 24 páginas del frontend — todas correctas; `/cuenta/seguridad` no chequea rol a propósito (solo toca la sesión propia, 2FA es opcional para todos los roles por igual).

**Nota de diseño, no vulnerabilidad:** `calificar-practica.ts` no expone `respuesta_correcta` al cliente, pero como no tiene límite de tasa, un script podría reconstruir las respuestas correctas por fuerza bruta enviando combinaciones. Queda documentado, no se actuó — fuera del alcance de esta auditoría (no es escalada de privilegios ni fuga de datos).

**Pendiente antes de cerrar esta auditoría:** re-ejecutar `tests/acceso.test.ts` y confirmar los 3 fixes en runtime (curl contra `/api/`) apenas la máquina libere el I/O de disco; decidir si se despliega al VPS.

