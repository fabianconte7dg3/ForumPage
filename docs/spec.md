# Spec técnica — Forum Foundation

> Resumen de referencia rápida. La fuente completa son los documentos 01–05 en la raíz del repo. Este archivo existe para no tener que releerlos en cada sesión; si hay conflicto, gana el documento numerado correspondiente.

## Qué es esto

Plataforma que reemplaza el WordPress de Forum Foundation (ONG educativa, Coclé norte, Panamá). No capta donaciones — la financia su fundador. Tres funciones: contar la historia, rendir cuentas a los fundadores (EE.UU.), y entregar recursos educativos a la comunidad.

**Problema raíz que gobierna todo:** el sitio anterior murió por fricción de publicación, no por falta de tecnología. Requisito duro: **publicar una actividad debe tomar menos de 3 minutos desde un teléfono.**

Detalle completo: [01-documento-de-proyecto.md](../01-documento-de-proyecto.md)

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| CMS / admin | Payload CMS 3 (corre dentro de la app Next.js) |
| Base de datos | PostgreSQL (Drizzle) |
| Mapa | MapLibre GL JS + teselas MapTiler/Protomaps, datos como GeoJSON estático precalculado |
| Proxy / TLS | Caddy |
| Orquestación | Docker Compose |
| Almacenamiento | DigitalOcean Spaces (S3-compatible), **nunca disco local** |
| Infra | Droplet 2 vCPU/4GB, NYC3, ~$35/mes total |

**Decisión clave de build:** compilar en GitHub Actions, no en el droplet (el build de Next.js+Payload necesita 1.5–3GB RAM en pico; el servidor solo recibe la imagen Docker ya construida).

Detalle completo: [03-runbook-tecnico.md](../03-runbook-tecnico.md)

## Principio rector

**Nada hardcodeado.** Comunidades, programas, niveles, materias, actividades, tutorías: todo son colecciones editables por el staff desde el panel. Ningún umbral (meta de horas, criterio de reprobación) vive en el código — vive en el global `Configuracion`.

**Presupuesto de rendimiento: 500 KB en la primera carga**, verificado en CI (falla la build si se excede). Mapa, gráficos y librerías pesadas van con `dynamic(..., { ssr: false })`.

## Modelo de datos (colecciones)

La **Comunidad** es el eje: todo apunta a ella y por eso el mapa se alimenta solo.

**Geográficas:** `Comunidades`, `Sedes` (con `destacada` para la Academia Forum), `CentrosEducativos`, `Programas` (color + ícono → filtros del mapa)

**Contenido:** `Actividades` (mural + blog unificados, un solo tipo de contenido), `Proyectos` (`foto_antes`/`foto_despues`), `Necesidades` (pipeline de necesidades, no crowdfunding), `Media` (`consentimiento_verificado`, `contiene_menores`)

**Aprendizaje (sin cuenta, sin datos personales):** `Recursos` (`fuente_y_licencia` obligatorio), `Practicas` (3 modalidades), `Tutorias`, `Niveles`, `Materias`. Progreso guardado en el dispositivo del estudiante, no en el servidor.

**Portal del Becario (autenticado, solo mayores de edad):**
- `Becarios` — incluye `estado` (activo/suspendido/graduado/retornado/retirado), `mostrar_en_mapa` + `consentimiento_firmado`, `meta_horas_personalizada` opcional
- `RegistrosAcademicos` — `materias_reprobadas`; al verificarse con reprobadas → dispara suspensión automática
- `Recuperaciones` — al verificarse → reactiva y libera desembolsos retenidos
- `HorasLaborSocial`, `Desembolsos` (estados: programado/retenido/pagado/cancelado — **nunca se eliminan**)
- `Usuarios` (roles: admin/staff/directiva/becario), `Auditoria` (solo escritura, sin edición/borrado desde el panel)

**Global:** `Configuracion` (registro único: meta de horas, calificaciones reprobatorias, texto de aviso de suspensión)

### Ciclo de vida del becario

```
ACTIVO ──reprueba materia──► SUSPENDIDO ──recupera materia──► ACTIVO
ACTIVO ──completa carrera──► GRADUADO
ACTIVO ──abandona──────────► RETIRADO
```

La suspensión es **reversible**, no una baja. Se dispara automáticamente al verificar un registro con al menos una materia reprobada — nunca depende de que alguien lo recuerde. El estado de suspensión **nunca se expone públicamente** (ni en mapa ni en cifras agregadas): un becario suspendido sigue siendo becario.

Detalle completo: [01-documento-de-proyecto.md §9](../01-documento-de-proyecto.md), hooks en [03-runbook-tecnico.md §6](../03-runbook-tecnico.md)

## Control de acceso (IAM)

Declarado por colección **y por campo** en Payload — no es una capa que se agregue después.

| | Público | Becario | Staff | Directiva | Admin |
|---|---|---|---|---|---|
| Contenido público (actividades, comunidades, proyectos...) | Lectura | Lectura | CRUD | Lectura | CRUD |
| Necesidades | Lectura si públicas | Lectura si públicas | CRUD | Lectura | CRUD |
| Becarios | Lectura solo `mostrar_en_mapa`, campos filtrados | Su perfil | CRUD | Lectura | CRUD |
| Registros académicos / Recuperaciones | — | Crea y lee propios | Verifica | Lectura | CRUD |
| Horas de labor social | — | Crea y lee propias | Aprueba | Lectura | CRUD |
| Desembolsos | — | Lee propios | CRUD | Lectura | CRUD |
| Configuración global | — | — | Edita | Lectura | Edita |
| Usuarios y roles | — | — | — | — | CRUD |
| Auditoría | — | — | — | Lectura | Lectura |

Reglas clave:
- **Cualquier staff verifica registros académicos** (sin doble aprobación) — el control es trazable, no preventivo
- `motivo_suspension` (visible al becario) ≠ `nota_interna_evaluacion` (solo staff/admin) — campos separados, nunca el mismo
- Documentación socioeconómica: solo staff/admin ven el expediente; directiva ve solo "requisito verificado"
- 2FA obligatorio para staff/directiva/admin; opcional para becarios
- Cuentas se desactivan, **nunca se borran** (rompería trazabilidad de verificaciones)
- Alta de becarios solo por invitación del staff — sin autorregistro

Detalle completo: [01-documento-de-proyecto.md §10](../01-documento-de-proyecto.md), [05-ciberseguridad.md §3.1–3.2](../05-ciberseguridad.md)

## Privacidad (Ley 81 de 2019, Panamá)

- Becarios (adultos): mapa público solo con `mostrar_en_mapa` = true **y** consentimiento firmado archivado. Revocable en cualquier momento por el propio becario.
- Nunca públicos ni agregados de forma identificable: condición socioeconómica, estado de suspensión.
- Menores: no tienen cuentas; Centro de Aprendizaje no recolecta datos personales; fotos requieren consentimiento de acudiente (`consentimiento_verificado`, `contiene_menores` en `Media`).
- Coordenadas de becarios: centroide de la comunidad de origen, nunca domicilio.

Detalle completo: [01-documento-de-proyecto.md §8](../01-documento-de-proyecto.md)

## Seguridad — los 5 riesgos que más importan

1. **Documentos de becarios en bucket público** → 3 buckets separados con credenciales distintas (`forum-media` público+CDN, `forum-docs` privado con URL firmada de 5–15 min, `forum-backups` privado sin permiso de borrado)
2. **Control de acceso incompleto en la API** → probar siempre contra `/api/`, nunca solo contra la interfaz
3. **Respaldos borrables con la misma credencial comprometida** → credenciales de escritura sin borrado, versionado activo
4. **GeoJSON con campos de más** → el filtro de consentimiento se aplica en el generador, nunca en el frontend; prueba de regresión en CI
5. **Cuenta de staff activa tras la salida** → procedimiento de baja el mismo día

Detalle completo: [05-ciberseguridad.md](../05-ciberseguridad.md) (los puntos **[CRÍTICO]** bloquean el lanzamiento)

## Bilingüismo

Localización a nivel de campo desde el día uno en Payload (`localized: true` en textos visibles al público; nombres, fechas, montos y coordenadas **no** se localizan). El selector ES/EN siempre lleva a la página equivalente, nunca al home.

Detalle completo: [01-documento-de-proyecto.md §11](../01-documento-de-proyecto.md)

## Sistema de diseño (resumen)

- **Paleta:** `montana` #17423B (primario), `tinta` #101C2B (texto), `cosecha` #C08A1E (acento/arcos), `rio` #2F7D8C (interacción), `piedra` #6B7770 (secundario), `niebla` #F2F4F1 (fondo)
- **Tipografía:** Archivo Expanded (display), Source Serif 4 (lectura), IBM Plex Mono (datos — fechas, cifras, coordenadas)
- **Geometría:** radio 4px, hairline 1px, sin sombras
- **El arco** (trayectoria de Coclé al mundo) es el elemento de firma — limitado a 3 apariciones: divisor de sección, insignia de comunidad, hero del home
- Rojo reservado solo para errores de formulario, **nunca** para "suspendido"

Detalle completo: [04-diseno-y-sistema-visual.md](../04-diseno-y-sistema-visual.md)

## Costos

~$35/mes (~$420/año): droplet $24 + Spaces/CDN $5 + backups $5 + dominio $15/año.
