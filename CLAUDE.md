# Forum Foundation — Plataforma

Reemplazo del WordPress de Forum Foundation (ONG educativa en Coclé norte, Panamá). No capta donaciones — la financia su fundador. Tres funciones: contar la historia, rendir cuentas a los fundadores en EE.UU., y entregar recursos educativos a la comunidad.

**Antes de trabajar en cualquier tarea de este repo, lee:**
- [docs/spec.md](docs/spec.md) — arquitectura, stack, modelo de datos, IAM, seguridad, diseño (resumen)
- [docs/plan.md](docs/plan.md) — fase actual, qué está hecho, qué sigue

Ambos son resúmenes vivos de los cinco documentos fuente en la raíz (`01-documento-de-proyecto.md` a `05-ciberseguridad.md`). Ante cualquier duda o conflicto, esos cinco documentos son la fuente de verdad — `docs/spec.md` y `docs/plan.md` deben actualizarse para reflejarlos, no al revés.

## Regla que gobierna todo el proyecto

El sitio anterior murió porque publicar era difícil, no por falta de tecnología. **Toda decisión técnica se evalúa contra: ¿esto hace que publicar una actividad tome menos de 3 minutos desde un teléfono?** Si una función complica el panel del staff, se recorta o se pliega en "avanzado".

## No negociables

- **Nada hardcodeado.** Comunidades, programas, niveles, materias: siempre colecciones editables por el staff en Payload, nunca en código.
- **Presupuesto de 500 KB** en la primera carga del sitio público. Falla el build en CI si se excede.
- **Localización a nivel de campo desde el día uno** (Payload `localization`). Agregarla después obliga a migrar todo el esquema.
- **El estado "suspendido" de un becario nunca se hace público**, ni siquiera de forma agregada. Es reversible, no una baja.
- **Control de acceso declarado explícitamente en cada colección de Payload** — nunca dejar el valor por defecto. La API expone todo lo que el `access` permita; se prueba contra `/api/`, no contra la interfaz.
- **Buckets separados**: medios públicos, documentos de becarios privados con URL firmada, respaldos sin permiso de borrado. Nunca en el mismo bucket.
- **Docs y specs actualizados en el mismo cambio que el código** que los vuelve obsoletos, en particular `docs/plan.md` al cerrar cada bloque de una fase.
- **`.gitignore` estricto desde el primer commit de código**, en la raíz y en cualquier sub-app que se agregue (ej. `apps/api/.gitignore`). Un repo que trackea `node_modules/` o `dist/` puede pasar de unos cientos de archivos fuente a decenas de miles: cualquier búsqueda global del agente escanea todo eso y agota el contexto en segundos. Lección de un proyecto anterior — no repetirla.
- **Editar con parches, no reescribir archivos enteros.** Cambiar 5 líneas de un archivo de 800 no justifica regenerarlo completo — consume miles de tokens de salida innecesarios. Usar siempre reemplazo selectivo del bloque exacto afectado.
- **Tareas atómicas de 1 a 10 archivos.** Nada de "construye todo el módulo X de una sola vez" (base de datos + backend + frontend + facturación junto). Dividir en pasos chicos y verificables, marcados en `docs/plan.md`, cada uno con su propia comprobación antes de seguir (ej. Paso A: schema + migración → Paso B: controller/service + `tsc --noEmit` → Paso C: UI + `tsc --noEmit`). Perder el contexto a mitad de una tarea gigante obliga a rehacer todo.

## Errores ya cometidos en este repo — no repetirlos

**Leer [.agents/AGENTS.md](.agents/AGENTS.md) §Errores ya cometidos antes de tocar código.** Cada regla sale de un defecto real que llegó a `main` y hubo que corregir después: campos cambiados sin seguir a quién los escribe, casts que callan a `tsc` en vez de arreglar el tipo, carpetas de uploads sin regla en `.gitignore`, scripts de borrado que eran no-op por construcción, migraciones generadas con el `down()` roto y nunca ejecutado, `overrideAccess: true` en páginas públicas que no repone el filtro de consentimiento que la colección aplicaría, listas hardcodeadas que el staff no puede editar, y `docs/plan.md` sin actualizar en el mismo commit que la feature. Viven en ese archivo, no acá, para que haya una sola copia y valga para cualquier agente que trabaje el repo.

## Cuándo usar qué skill de `.agents/skills/`

- `frontend-design`, `design-guide`, `web-design-guidelines` → sitio público, componentes, panel de Payload
- `backend-development`, `backend-dev-guidelines`, `senior-backend` → colecciones de Payload, hooks, control de acceso, migraciones

## Estado

Ver [docs/plan.md](docs/plan.md) — Fases 0 a 2 cerradas, Fase 3 (Portal del Becario) en curso.
