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

## Cuándo usar qué skill de `.agents/skills/`

- `frontend-design`, `design-guide`, `web-design-guidelines` → sitio público, componentes, panel de Payload
- `backend-development`, `backend-dev-guidelines`, `senior-backend` → colecciones de Payload, hooks, control de acceso, migraciones

## Estado

Ver [docs/plan.md](docs/plan.md) — a la fecha de este commit, el proyecto está en Fase 0 (preparación), sin código de aplicación todavía.
