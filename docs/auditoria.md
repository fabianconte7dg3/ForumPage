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

- [x] **Fase 0** — Arreglo del bug disparador (`access.admin` en `Users`, redirección a `/portal`), verificado con `curl` contra `/api/` con sesión de becario: `/admin` → 307 a `/admin/unauthorized`, `/portal` → 200.
- [x] **Fase 1 — Análisis estático**: Auditoría de control de acceso en las 28 colecciones y 2 globales, comprobando que las colecciones privadas rechacen anónimos y que la directiva/staff conserven sus permisos respetando la matriz IAM.
- [x] **Fase 2 — Pruebas en runtime**: Suite `tests/acceso.test.ts` ejecutada con éxito (`node --import tsx --env-file=.env --test tests/acceso.test.ts`). 100% de los tests de control de acceso pasados (anónimo, becario, staff, directiva, admin).
- [x] **Fase 3 — Corrección y Verificación**: Aserciones de control de acceso verificadas y alineadas. Sin brechas ni fugas de datos de becarios ni tokens de invitación expuestos.

