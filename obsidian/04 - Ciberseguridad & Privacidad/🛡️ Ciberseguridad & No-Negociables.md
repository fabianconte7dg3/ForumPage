---
title: "Ciberseguridad & No-Negociables"
tags:
  - ciberseguridad
  - privacidad
  - no-negociables
  - 2fa
  - auditoria
aliases:
  - Ciberseguridad
  - No-Negociables
  - Privacidad
date: 2026-07-30
status: activo
---

# 🛡️ Ciberseguridad & No-Negociables — Forum Foundation

> [!security] Principios Inquebrantables de Seguridad
> Reglas y controles extraídos del documento `05-ciberseguridad.md` y las políticas del proyecto.

---

## ⛔ Reglas No-Negociables

1. **Protección de Menores de Edad**:
   - La colección `Media` implementa validación cruzada: `contiene_menores: true` requiere obligatoriamente `consentimiento_verificado: true`.
2. **Privacidad Absoluta de Suspensiones**:
   - El estado `suspendido` de un becario nunca se expone al público ni de forma agregada. Los campos `estado`, `motivo_suspension`, `fecha_suspension` y `fecha_reactivacion` en [[🗄️ Modelo de Datos y Colecciones|Becarios]] poseen `FieldAccess` restringido exclusivamente al propio becario y al staff.
3. **Privacidad de Solicitantes de Carencias**:
   - El campo `solicitante` en [[🗄️ Modelo de Datos y Colecciones|Necesidades]] tiene `FieldAccess` `esStaffDirectivaOAdminFieldAccess`. Se oculta en consultas públicas para proteger la privacidad del comunero que reporta una necesidad.
4. **Protección Anti-Spam en Formularios Públicos**:
   - El formulario de reporte de necesidades ([FormularioNecesidad.tsx](file:///home/fabianc/Documentos/ForumPage/src/components/FormularioNecesidad.tsx)) incluye un campo señuelo oculto (*honeypot*). Si un bot completa dicho campo, el Server Action simula éxito sin escribir en la base de datos.
5. **Auditoría Activa e Inmutable en 7 Eventos Clave**:
   - La colección `Auditoria` registra automáticamente 7 eventos de negocio (`suspension_automatica`, `reactivacion_automatica`, `verificacion_registro_academico`, `verificacion_recuperacion`, `aprobacion_horas`/`rechazo_horas`, `cambio_estado_desembolso` y `cambio_de_rol`). La escritura manual está totalmente bloqueada.
6. **Privacidad de Documentación Socioeconómica & Evaluaciones**:
   - Los campos `nota_interna_evaluacion` en [[🗄️ Modelo de Datos y Colecciones|RegistrosAcademicos]] y `documentacion_socioeconomica` en [[🗄️ Modelo de Datos y Colecciones|Becarios]] son de lectura restringida a Staff/Admin.
7. **Duración Diferenciada de JWT / Sesiones**:
   - Sesiones del personal (`admin`, `staff`, `directiva`) duran máximo **2 horas**. Sesiones de becarios duran **30 días**.
8. **Protección contra Salteo de 2FA en Reset de Contraseña**:
   - El endpoint `/api/users/reset-password` exige la verificación de 2FA TOTP si la cuenta lo tenía habilitado.
9. **Procedimiento de Baja Inmediata (Bloqueo en Login)**:
   - Las cuentas se desmarcan con `activo = false`. El hook `beforeLogin` de Payload rechaza inmediatamente el inicio de sesión.
10. **Autenticación de Dos Factores (2FA TOTP Opcional)**:
    - Mecanismo TOTP (RFC 6238) completo con secreto cifrado e inalcanzable por API (`{ create: () => false, read: () => false, update: () => false }`). 2FA es **opcional para todos los roles**.
11. **Alta Segura por Invitación**:
    - Contraseña provisional invalidada con string aleatorio de 32 bytes y `enlace_invitacion` de 1 solo uso que vence en 1 hora.
12. **Desactivación de GraphQL**:
    - GraphQL está totalmente desactivado en `payload.config.ts`.
13. **Sanitización de Contenido Lexical**:
    - Serializado vía `@payloadcms/richtext-lexical/react`. Prohibido `dangerouslySetInnerHTML`.
14. **Inmutabilidad de Desembolsos**:
    - Permiso `delete` en [[🗄️ Modelo de Datos y Colecciones|Desembolsos]] retorna `() => false` para todos los roles.
15. **Documentos de expediente nunca en el bucket público** (remediación 2026-08-01/03, **migración confirmada en dev, producción pendiente del droplet**):
    - `Becarios.documentacion_socioeconomica`, `RegistrosAcademicos.documento`, `HorasLaborSocial.evidencia` y `Recuperaciones.evidencia` migraron de `Media` (pública) a [[🗄️ Modelo de Datos y Colecciones|DocumentosPrivados]] (solo-staff en las cuatro operaciones). Ver [[🚀 Plan de Ejecución & Estado de Fases]] para el estado exacto — las 17 migraciones están aplicadas contra el Postgres de dev y `pnpm purgar:media-privada` da 0 a borrar hoy; solo falta correr contra producción cuando exista droplet.
16. **Foto de becario condicionada al consentimiento** (2026-08-04): `Becarios.foto` pasó de `Media` (siempre pública) a [[🗄️ Modelo de Datos y Colecciones|FotosBecarios]], con `access.read` condicional a un campo `publica` que un hook sincroniza con `mostrar_en_mapa` en cada save. Antes, apagar el consentimiento sacaba al becario de `/api/becarios` pero su foto seguía sirviéndose para siempre — resuelto sin depender de buckets S3.

---

## 🪣 Aislamiento de Almacenamiento (Buckets)

```mermaid
graph TD
    Client["🌐 Petición de Medios"] --> Router{"¿Qué tipo de archivo es?"}
    Router -->|Imágenes públicas| PubBucket["🖼️ Bucket Público (Read-Only CDN)"]
    Router -->|Documentos de Becarios| PrivBucket["🔐 Bucket Privado (URL Firmada / Expirable)"]
    Router -->|Respaldos DB| BackupBucket["📦 Bucket de Backups (Sin permiso de borrado WORM)"]
```

> [!warning] Estado real (no aspiracional)
> Solo el nivel de **colección** está hecho (`Media` pública vs. `DocumentosPrivados` solo-staff vs. `FotosBecarios` condicional). A nivel de **almacenamiento** no hay todavía adaptador S3 — los archivos siguen en disco local y el control de acceso lo aplica Payload en la ruta del archivo (`access.read` evaluado en cada request), no 3 buckets físicos separados. Esto alcanza para el caso de `Becarios.foto` (2026-08-04): pública solo si `mostrar_en_mapa` sigue activo. Al mover a S3 hay que separar los buckets de verdad y firmar URLs — pero eso es un cambio de *dónde* vive el archivo, no un rediseño del control de acceso, que ya es correcto hoy.
>
> **Decisión del fundador (2026-08-04):** riesgo aceptado por presupuesto — medios/documentos/respaldos van a seguir juntos en el disco de un único VPS, no en tres buckets de Spaces, mientras no haya presupuesto para eso. Compromiso explícito para no dejar la brecha de respaldo del todo abierta: los `pg_dump` se copian fuera del droplet (servidor personal en casa o disco en la nube, todavía sin definir cuál) — un respaldo que vive en el mismo disco que respalda no cuenta como respaldo real. Detalle en [[🚀 Plan de Ejecución & Estado de Fases]], Fase 1.

---

## 🕵️ Auditoría OWASP Top 10 (2026-08-04)

> [!check] Apto para publicar
> Reporte completo: [docs/security-audit-2026-08-04.md](file:///home/fabianc/Documentos/ForumPage/docs/security-audit-2026-08-04.md). Semgrep + gitleaks + `pnpm audit` + revisión manual de las 24 colecciones/2 globals contra `01-documento-de-proyecto.md`, todo probado en vivo con `curl`. **Sin vulnerabilidades críticas ni de severidad alta explotables en el código propio.**

9 cambios el mismo día, los dos más importantes son de A01 (control de acceso): `Necesidades.costo_estimado` y `Becarios.condicion_socioeconomica_verificada` estaban visibles a cualquier anónimo por falta de `field-access` — mismo tipo de hueco que ya se había encontrado y cerrado en `Becarios.foto` unas horas antes, esta vez detectado por la auditoría en vez de por una pregunta del usuario. También: mínimo de contraseña inconsistente (Payload por defecto exige 3 caracteres; el flujo de invitación de becarios no tenía el mínimo de 8 que sí exige "Cambiar contraseña"), `next`/`sharp` actualizados (corrigen 8 CVEs de severidad alta entre los dos), y tres endurecimientos de config (`X-Powered-By` fuera, `Permissions-Policy` restrictiva).

**Actualización 2026-08-04, mismo día:** Payload actualizado a 3.87.0 — cierra el SQL injection de `drizzle-orm` que era el pendiente de mayor severidad. Verificado de punta a punta contra el servidor real (login en dos pasos con 2FA, política de contraseña fuerte, bloqueo por fuerza bruta, matriz de acceso de las 24 colecciones), sin regresiones.

**Actualización 2026-08-04, mismo día — hardening del VPS real: `ufw`, `fail2ban`, rate limiting en Caddy.** Cierra el ítem de "límite de tasa" de §3.10 que había quedado pendiente en la auditoría por no existir todavía un servidor real donde probarlo. `ufw` (solo 22/80/443, 22 con `limit`), `fail2ban` en `sshd` (ya baneó IPs reales de escaneo en las primeras horas), y — lo más relevante — Caddy oficial no trae rate limiting, así que se armó `Dockerfile.caddy` (build con `xcaddy` + plugin `caddy-ratelimit`) limitando `/api/users/*` (login, 2FA, recuperación de contraseña, invitación) a 30 pedidos/minuto por IP, capa de red adicional al bloqueo de 5 intentos por cuenta que ya hacía Payload. Verificado contra el sitio real: la request 31 de una ráfaga a `/api/users/login` da `429`. Detalle en [[🚀 Plan de Ejecución & Estado de Fases]], Fase 1, Paso S.

**Actualización 2026-08-04, mismo día — CSP cerrada, sin pendientes de esta auditoría:** implementada como nonce por request en `src/proxy.ts` (no en el `Caddyfile` como se había anticipado — Next.js detecta el nonce solo desde el header de salida y lo aplica a su propio JS, sin tocar el reverse proxy). `script-src` con `'nonce-<random>' 'strict-dynamic'`; `style-src` con `'unsafe-inline'` a propósito (los nonces no cubren atributos `style=""` inline, y el sitio + admin de Payload usan `style={{}}`); dominios reales explícitos, no wildcard: `api.maptiler.com`/`{a,b,c}.basemaps.cartocdn.com` en `connect-src` (tiles del mapa), `i.ytimg.com` en `img-src`, `youtube-nocookie.com` en `frame-src`, `worker-src 'self'` explícito para el worker propio de `maplibre-gl`. Probada contra un build de producción real (`node .next/standalone/server.js`, no dev): `/admin`, `/portal`, mapa completo e iframe de YouTube cargan sin errores; cada directiva confirmada con el evento `securitypolicyviolation` en ambos sentidos (dominio permitido pasa, dominio inventado se bloquea). Detalle en [[🚀 Plan de Ejecución & Estado de Fases]], Fase 3.

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🔐 Matriz IAM y Permisos]]
- [[🗄️ Modelo de Datos y Colecciones]]
- [[📋 Pipeline de Necesidades & Directiva]]
- [[⚙️ Runbook Técnico & Entornos]]
