# Auditoría de seguridad — OWASP Top 10 (2026-08-04)

Auditoría completa de Forum Foundation (Payload CMS 3 + Next.js 16 + PostgreSQL) contra el [OWASP Top 10 2021](https://owasp.org/Top10/), pedida por el usuario antes de publicar el sitio. Alcance: todo el código de `src/`, la configuración de infraestructura (Docker, Caddy, CI), las dependencias, y el historial completo de git.

**Veredicto general: el sitio está en buen estado para publicarse.** No se encontró ninguna vulnerabilidad crítica ni de severidad alta explotable en el código de la aplicación. Se encontraron y corrigieron 3 fugas reales de datos (dos de acceso a nivel de campo, una de política de contraseñas débil) y se hicieron 5 endurecimientos adicionales de bajo riesgo. Quedan 2 pendientes que requieren decisión del usuario antes de publicar (ver "Pendientes que requieren tu decisión").

## Metodología

- **Dependencias**: `pnpm audit` (registro de npm/GitHub Advisories) sobre las ~940 dependencias resueltas.
- **Análisis estático**: [Semgrep](https://semgrep.dev/) con los rulesets `p/owasp-top-ten`, `p/javascript`, `p/typescript`, `p/react`, `p/nextjs`, `p/secrets` (598 reglas) sobre todo `src/`.
- **Secretos en git**: [gitleaks](https://github.com/gitleaks/gitleaks) sobre las 116 commits del historial completo (`--log-opts=--all`), complementado con búsqueda manual dirigida (gitleaks tiene puntos ciegos reales, ver más abajo).
- **Control de acceso**: lectura manual del `access` declarado en las 24 colecciones + 2 globals de Payload, cruzado contra `01-documento-de-proyecto.md` (la fuente de verdad de la matriz de permisos), y verificado en vivo con `curl` contra `/api/` — nunca solo contra la interfaz, como exige `CLAUDE.md`.
- **Pruebas dinámicas**: contra el dev server local y contra un build de producción real (`next build` + `node .next/standalone/server.js`, `NODE_ENV=production`) para confirmar que el comportamiento de errores/headers en producción es el que realmente se va a desplegar, no el de desarrollo.
- Todas las cuentas de prueba fueron descartables, creadas y borradas con scripts de un solo uso vía la API Local de Payload — nunca se tocó la cuenta real del usuario ni se usó el navegador compartido para pruebas autenticadas sensibles (ver memoria de sesión sobre por qué).

---

## A01:2021 — Broken Access Control

**Resultado: 1 hueco de diseño real cerrado hoy (Becarios.foto), 2 fugas de campo reales cerradas hoy, resto correcto.**

### Corregido hoy

1. **`Necesidades.costo_estimado` visible a cualquier anónimo vía `/api/necesidades`.** El campo `solicitante` de la misma colección ya estaba correctamente restringido a staff/directiva/admin (`esStaffDirectivaOAdminFieldAccess`), pero `costo_estimado` no tenía ninguna restricción de campo — se comprobó en vivo creando un caso de prueba con `visible_publicamente: true` y confirmando que `costo_estimado: 12345` aparecía sin sesión en `/api/necesidades`. **Impacto**: cualquier visitante podía ver la estimación interna de costo de una necesidad comunitaria reportada — información financiera interna, no pensada para ser pública. **Fix**: `src/collections/Necesidades.ts`, mismo `access: { read: esStaffDirectivaOAdminFieldAccess }` que ya usaba `solicitante`. Verificado: el campo ya no aparece en `/api/necesidades` para anónimos, y la página interna `/directiva/necesidades` (que usa `overrideAccess: true`) lo sigue mostrando sin cambios.

2. **`Becarios.condicion_socioeconomica_verificada` visible a cualquier anónimo.** Campo booleano interno ("¿se verificó la condición socioeconómica de este becario?") sin restricción de lectura — visible en `/api/becarios` para cualquier becario con `mostrar_en_mapa: true`. El propio comentario del campo en el código ya decía "no es un campo de perfil, solo se registra que se verificó", y `01-documento-de-proyecto.md` especifica que solo staff/directiva/admin deben ver este tipo de dato de elegibilidad. **Fix**: mismo patrón, `access: { read: esStaffDirectivaOAdminFieldAccess, update: esStaffOSuperiorFieldAccess }`. Verificado en vivo: ausente de `/api/becarios` tras el fix.

3. **`Becarios.foto` seguía siendo pública para siempre incluso después de que el becario revocara su consentimiento** (`mostrar_en_mapa: false`) — hueco ya identificado en la auditoría de privacidad de documentos del 2026-08-01/03, cerrado en este mismo día de trabajo (ver `docs/plan.md`, entrada "Becarios.foto: privacidad condicionada al consentimiento"). Nueva colección `FotosBecarios` con `access.read` condicional a un campo `publica` sincronizado automáticamente con `mostrar_en_mapa`. Verificado con `curl`: 200 anónimo con consentimiento activo, 403 tras revocarlo.

### Verificado y correcto (sin cambios)

- **Matriz completa de las 24 colecciones + 2 globals**: cada una tiene un `access` declarado explícitamente (ninguna quedó en el default inseguro de Payload). Probado en vivo, anónimo, contra las 24 colecciones:
  - **GET**: público donde debe serlo (comunidades, sedes, actividades, becarios filtrados por `mostrar_en_mapa`, necesidades filtradas por `visible_publicamente`, etc.) → `200`. Interno (`users`, `documentos-privados`, `auditoria`, `registros-academicos`, `recuperaciones`, `horas-labor-social`, `desembolsos`) → `403`.
  - **POST** (creación): `403` en las 24 colecciones sin excepción — ninguna permite escritura anónima.
- **`Practicas.respuesta_correcta`/`retroalimentacion`**: confirmado ausente de `/api/practicas` público (protege contra hacer trampa en los quiz).
- **`Recuperaciones`/`RegistrosAcademicos`/`HorasLaborSocial` con lectura de `directiva`**: en un primer paso pareció un hueco (¿por qué directiva ve datos ligados a una suspensión, si CLAUDE.md dice que el estado suspendido nunca es público?). Se verificó contra `01-documento-de-proyecto.md` §10 ("Directiva: lectura sobre todo el sistema, sin escritura en nada" + tabla explícita de visibilidad de `motivo_suspension`) y quedó confirmado que es el diseño correcto: "nunca público" se refiere a visitantes anónimos, no a la junta directiva autenticada. El único campo con exclusión deliberada de directiva es `DocumentosPrivados` (el archivo en sí), ya implementado correctamente.
- **IDOR en creación**: `HorasLaborSocial`, `RegistrosAcademicos`, `Recuperaciones` permiten `create` a cualquier becario autenticado, pero un hook `beforeChange` (`forzarPropioBecario`) sobreescribe el campo `becario` incondicionalmente con el ID del usuario que hace la petición — un becario no puede crear un registro a nombre de otro aunque lo intente en el body del POST. Confirmado leyendo el código, no solo asumido.
- **GraphQL**: completamente desactivado, `404` real (no solo bloqueado por access) — mejor resultado posible.

---

## A02:2021 — Cryptographic Failures

**Resultado: 1 hueco de política de contraseñas cerrado hoy, resto correcto.**

### Corregido hoy

4. **Política de contraseñas inconsistente — mínimo real de 3 caracteres en el flujo que usan todos los becarios.** `cambiar-password.ts` (la pantalla de "Seguridad de mi cuenta") exige 8 caracteres mínimo, pero ese chequeo vive solo en esa Server Action. El endpoint nativo de Payload `/api/users/reset-password` — que es el que usa **todo becario invitado** para activar su cuenta por primera vez, y cualquier futuro flujo de "olvidé mi contraseña" — no tiene ningún override y usa el mínimo por defecto de Payload, que es **3 caracteres**. Verificado empíricamente contra la validación real (no solo leyendo el código): `"ab"` rechazada, `"abc"` aceptada, antes del fix.
   **Fix**: nuevo hook `beforeValidate` en `src/collections/Users.ts` (`exigirPasswordFuerte`) que rechaza cualquier contraseña de menos de 8 caracteres con un `APIError` 400 claro, aplicándose a **todos** los caminos que tocan el campo `password` (creación, reset, cambio), no solo al de autoservicio. No afecta la contraseña de relleno aleatoria de 32 bytes que el sistema genera al invitar a un becario (muy por encima de 8 caracteres). Verificado tras el fix: 2/3/7 caracteres rechazados, 8 aceptados, la invitación de becarios sigue generando su enlace normalmente.

### Verificado y correcto (sin cambios)

- **`PAYLOAD_SECRET`** real en `.env`: 44 caracteres, no es un placeholder/default. `.env` nunca estuvo en el historial de git (confirmado con `git log --all -- .env`).
- **Bloqueo de fuerza bruta en login**: probado en vivo contra una cuenta descartable — 5 intentos fallidos bloquean la cuenta 10 minutos (default de Payload, `maxLoginAttempts: 5`/`lockTime: 600000`), incluso con la contraseña correcta en el 6º intento. El endpoint `/login` custom (necesario para el flujo de 2FA en dos pasos) sigue pasando por `payload.login()` internamente, así que hereda esta protección sin tener que reimplementarla.
- **No hay enumeración de usuarios en login**: mensaje idéntico (`"The email or password provided is incorrect."`) para email inexistente y para contraseña incorrecta de una cuenta real, verificado con ambos casos.
- **JWT de sesión**: reutiliza `jwtSign`/`getFieldsToSign` internos de Payload (mismo algoritmo/firma que el resto del sistema, no una implementación propia). Cookie con `HttpOnly; SameSite=Lax; Secure` (en producción). Duración diferenciada por rol (2h staff/directiva/admin, 30 días becario) — coincide exactamente con `01-documento-de-proyecto.md`.
- **2FA (TOTP)**: implementación propia (`src/lib/totp.ts`) verificada contra los 4 vectores de prueba oficiales del Apéndice B de RFC 6238 antes de integrarse (verificado en una sesión anterior, no reabierto acá). Secreto (`dosFA_secreto`) con `access: { create: () => false, read: () => false, update: () => false }` — nunca viaja por la API a nadie, ni al dueño ni a un admin.
- **Desafío de 2FA en memoria**: el JWT ya emitido por `payload.login()` se retiene server-side hasta confirmar el segundo factor (nunca se firma un token "provisional" de menor confianza aparte); 5 intentos máximo antes de invalidar el desafío, TTL de 5 minutos. Nota de diseño ya documentada en el código (`ponytail:` comment): el mapa de desafíos es de un solo proceso — si el despliegue escala a varias instancias sin sticky sessions, hay que subir a un store compartido (Redis) antes de eso.
- **Secreto TOTP en texto plano en la base**: no encriptado a nivel de columna, solo protegido por control de acceso de API. Nota de bajo riesgo, no una vulnerabilidad activa dado el modelo de amenaza actual (Postgres nunca expone su puerto fuera de la red de Docker — confirmado en `docker-compose.staging.yml`), pero si algún día se agrega cifrado a nivel de aplicación para datos sensibles, este campo es candidato.

---

## A03:2021 — Injection

**Resultado: sin hallazgos. Cobertura sólida por diseño.**

- **Sin `dangerouslySetInnerHTML`** en absolutamente ningún componente (`grep` directo, no solo confiar en la regla de Semgrep) — el contenido rico (Lexical) se renderiza siempre con el serializador oficial `@payloadcms/richtext-lexical/react`.
- **Sin `eval`/`new Function`**, sin `child_process.exec`/`execSync`/`spawn` con input dinámico en ningún script ni ruta de la app.
- **Inyección NoSQL/Where en el login**: el endpoint custom `/login` valida explícitamente que `email`/`password` lleguen como `string` antes de pasarlos a `payload.login()` — hay un comentario en el código que documenta exactamente este riesgo (`{"email":{"$ne":null}}` colándose tal cual). Probado en vivo: un intento de inyección con objetos en vez de strings es rechazado con 400 antes de tocar la base.
- **Filtros de búsqueda por query param** (`/historias?comunidad=`, `/aprende/biblioteca?tipo=`, etc.): siempre pasan por `Number(...)` antes de construir el `where` — un valor no numérico se convierte en `NaN`, que no matchea nada (falla segura), y de todos modos el ORM (Drizzle, vía Payload) parametriza las queries, no concatena SQL.
- **Sin SQL crudo con interpolación de datos externos** fuera de las migraciones (que son generadas por Payload y no reciben input de usuario).

---

## A04:2021 — Insecure Design

**Resultado: sin hallazgos críticos. Una recomendación de bajo riesgo, no implementada.**

- **Formulario público de Necesidades** (`reportarNecesidad`): campo señuelo (honeypot) que descarta silenciosamente envíos de bots, validación de longitud en los tres campos de texto, inserción server-side con `overrideAccess` (nunca expone un POST público abierto directo a `/api/necesidades`, que de por sí ya rechaza escritura anónima).
- **Invitación de becarios**: reutiliza el mecanismo de "olvidé mi contraseña" nativo de Payload — token de un solo uso, vence en 1 hora, la contraseña de relleno original queda invalidada con un valor aleatorio de 32 bytes que nadie conoce. Verificado en una sesión anterior (no reabierto acá) que reusar un token ya consumido falla.
- **Recomendación no implementada — rate limiting por IP en el formulario público de Necesidades**: no hay throttling más allá del honeypot. Riesgo bajo (el peor caso es spam de reportes falsos que el staff filtra manualmente, no una fuga de datos ni una toma de cuenta), y agregar un rate-limiter real necesitaría infraestructura (Redis o similar) que no existe todavía. Queda como mejora futura, no bloqueante para publicar.

---

## A05:2021 — Security Misconfiguration

**Resultado: 3 endurecimientos aplicados hoy (todos de bajo riesgo, cero probabilidad de romper nada), 1 recomendación pendiente de decisión.**

### Corregido hoy

5. **`X-Powered-By: Next.js, Payload` en cada respuesta.** Fingerprinting gratuito del stack tecnológico para cualquiera que busque CVEs conocidos. **Fix**: `poweredByHeader: false` en `next.config.ts`. Verificado ausente tanto en dev como en el build de producción real.

6. **`Permissions-Policy` ausente.** El sitio no usa cámara, micrófono, geolocalización ni pagos en ningún lado (confirmado por grep — cero referencias a `navigator.geolocation`/`getUserMedia`). **Fix**: agregado `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` en `Caddyfile`. Solo restringe, no puede romper nada que ya funcionaba.

### Verificado y correcto (sin cambios)

- **Headers de seguridad ya existentes en `Caddyfile`**: `Strict-Transport-Security` (1 año, `includeSubDomains`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, límite de tamaño de body (25MB).
- **CORS**: sin configuración explícita, Payload usa su default seguro — confirmado con `curl` que un `Origin` arbitrario NO recibe `Access-Control-Allow-Origin` ni en `GET` ni en el preflight `OPTIONS`. Un navegador real bloquearía la lectura de la respuesta desde otro origen.
- **GraphQL**: desactivado con `404` real, no solo bloqueado.
- **`/admin` sin sesión**: muestra la pantalla de login de Payload (200, correcto), no filtra nada.
- **Mensajes de error en producción**: probado con una petición `TRACE` (método no soportado) y con un ID no numérico en `/api/becarios/:id` contra el **build de producción real** (no el dev server, que sí muestra stack traces completos con rutas del filesystem — eso es comportamiento esperado y estándar de Next.js en modo desarrollo, nunca se despliega así). En producción: `"Internal Server Error"` plano y `{"errors":[{"message":"Something went wrong."}]}` respectivamente, sin ningún detalle interno.

### Pendiente de decisión (no implementado hoy)

- **Content-Security-Policy (CSP)**: no existe. Sería una capa extra de defensa contra XSS (aunque ya se confirmó que no hay `dangerouslySetInnerHTML` en el código), pero armarla a ciegas es riesgoso — el panel `/admin` de Payload típicamente necesita `'unsafe-inline'`/`'unsafe-eval'` para su propio JS empaquetado, y el sitio carga tiles de mapa externos (CartoDB/MapTiler) y embeds de YouTube (`youtube-nocookie.com`) que necesitarían quedar explícitamente permitidos. Una CSP mal armada en el `Caddyfile` de producción podría dejar al staff sin poder entrar a `/admin` — no es un cambio para hacer sin probarlo a fondo primero. **Recomendación**: armar y probar una CSP en un ambiente de staging real antes de aplicarla a producción, no como parte de esta auditoría.

---

## A06:2021 — Vulnerable and Outdated Components

**Resultado: de 37 avisos a 17, 0 críticos en ningún momento. Resto pinneado por Payload mismo.**

### Corregido hoy

7. **`next` 16.2.7 → 16.2.12**: parche directo, sin cambios de comportamiento esperados. Corrige 4 CVEs de severidad **alta** (bypass de middleware, SSRF en Server Actions, SSRF en rewrites) y 5 de severidad **moderada** propios de Next.js.
8. **`sharp` 0.34.2 → 0.35.3** (+ override global a `>=0.35.0` para la instancia adicional que trae `next` como dependencia opcional): corrige 4 CVEs de libvips de severidad **alta**.
9. **`postcss`, `dompurify`** forzados a versiones parcheadas vía `pnpm-workspace.yaml` overrides — ambos son dependencias de build/admin (`@tailwindcss/postcss` y el editor Monaco del panel de Payload), nunca corren en el sitio público.
10. **Intento de override de `brace-expansion` revertido tras romper ESLint.** El paquete publica dos líneas de versión mayor incompatibles bajo el mismo nombre (1.x y 5.x); un override "por major" forzó la API equivocada a `minimatch@3` y rompió el lint (`TypeError: expand is not a function`). Se revirtió de inmediato. Es deuda de solo lint (nunca corre en producción), y el DoS que corrige requiere que un atacante controle los patrones glob que se le pasan a ESLint — no es explotable remotamente en este proyecto. Se documentó la razón en `pnpm-workspace.yaml` para que nadie reintente el mismo override sin saber por qué falló.

### Pendiente — requiere su propia tanda de trabajo, no se tocó hoy

- **`drizzle-orm` (SQL injection, severidad ALTA), `undici` (6 avisos, altos y moderados), `fast-uri`, `uuid`, `esbuild`**: los cinco están fijados por las dependencias internas de `payload@3.82.1` y sus paquetes `@payloadcms/*` — no se pueden actualizar de forma aislada sin arriesgar romper el adaptador de base de datos. **Se verificó que `payload@3.87.0` (la versión estable más reciente, 5 versiones menores por delante) ya trae `drizzle-orm@0.45.2`**, que es exactamente la versión que corrige el SQL injection. Actualizar Payload de 3.82.1 a 3.87.0 es la vía correcta para cerrar esto — pero es un cambio de alcance mucho mayor (regenera `payload-types.ts`, puede tener breaking changes en hooks/access/endpoints personalizados) que merece su propia tarea atómica con verificación dedicada, no algo para meter de pasada en una auditoría. **Recomendación: programar la actualización de Payload como el siguiente bloque de trabajo grande, antes de publicar si es posible.**
  - Nota sobre el SQL injection de `drizzle-orm` específicamente: el CVE es sobre identificadores SQL mal escapados. Este proyecto nunca construye identificadores de columna/tabla dinámicamente a partir de input de usuario (los `sql` crudos que existen están solo en migraciones generadas, sin interpolación externa) — el riesgo real hoy es bajo, pero sigue siendo la corrección correcta.
  - `esbuild` es una dependencia de `tsx` (herramienta de desarrollo, nunca se ejecuta en producción) — su hallazgo es "cualquier sitio puede mandarle requests al dev server y leer la respuesta", que solo importa si alguien corre `pnpm dev` en una red no confiable.

---

## A07:2021 — Identification and Authentication Failures

Cubierto en su mayoría dentro de A02 (mismo código). Resumen:

- ✅ Fuerza bruta de contraseña bloqueada (5 intentos / 10 min).
- ✅ Fuerza bruta de 2FA bloqueada (5 intentos, invalida el desafío).
- ✅ Sin enumeración de usuarios.
- ✅ Sesiones diferenciadas por rol, invalidables todas a la vez desde "Seguridad de mi cuenta".
- ✅ **(Corregido hoy)** Política de contraseña débil en el flujo de invitación — ver A02, hallazgo #4.

---

## A08:2021 — Software and Data Integrity Failures

**Resultado: 1 hallazgo de bajo riesgo, no corregido (requiere decisión, no es urgente).**

- **Referencias mutables en la cadena de build**: `.github/workflows/ci.yml` usa `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4` (tags, no SHAs fijos — detectado por Semgrep), y `Dockerfile` usa `node:22-alpine` (tag flotante, no un dígest). En teoría, si alguna de esas referencias fuera comprometida en origen, un build futuro podría traer código malicioso sin que nadie lo note. En la práctica: son acciones oficiales/de altísimo perfil (GitHub, npm, Docker Official Images) — una compromisión real sería noticia inmediata y de alto impacto público, no un vector silencioso. **Recomendación, no aplicada**: pinnear a SHA completo cuando haya tiempo dedicado a probar que el pin no rompe el build (`docker inspect --format='{{index .RepoDigests 0}}' node:22-alpine` para obtener el dígest actual).
- `pnpm-lock.yaml` versionado y `pnpm install --frozen-lockfile` en CI: instalaciones reproducibles, sin sorpresas de versión entre máquinas — correcto.

## A09:2021 — Security Logging and Monitoring Failures

**Resultado: cobertura de Auditoria coincide exactamente con lo documentado en la fuente de verdad. Sin hallazgos nuevos.**

- `Auditoria` registra: cambios de estado del becario (suspensión automática, reactivación), verificaciones académicas, aprobación/rechazo de horas de labor social, cambios de estado de desembolsos, cambios de rol de cuentas — **exactamente** el alcance que especifica `01-documento-de-proyecto.md` §Operación ("Auditoría sobre: cambios de estado del becario, verificaciones académicas, aprobación de horas, desembolsos y cambios de rol"), ni más ni menos.
- **Observación, no un hallazgo**: cambios de contraseña, activación/desactivación de 2FA, y cierre masivo de sesiones no quedan en `Auditoria` — está fuera del alcance documentado, así que no es una desviación del diseño. Si en el futuro se quiere trazabilidad de esos eventos también, es una decisión de producto a tomar explícitamente, no algo que esta auditoría deba forzar.
- No hay visibilidad centralizada de intentos de login fallidos/bloqueos de cuenta más allá del contador interno de Payload (nadie ve "esta cuenta viene siendo atacada" salvo revisando la base a mano). Razonable de dejar para cuando exista un droplet real y alguien monitoreando — no bloqueante para el lanzamiento inicial.

## A10:2021 — Server-Side Request Forgery (SSRF)

**Resultado: sin hallazgos. Superficie de ataque nula.**

- **Cero llamadas `fetch()` server-side con una URL controlada por el usuario** en todo `src/` (verificado por grep, no solo asumido). `src/lib/youtube.ts` solo extrae el ID de video de una URL con una expresión regular — nunca hace una petición HTTP server-side a esa URL.

---

## Resumen de cambios aplicados hoy

| # | Archivo | Cambio | Categoría |
|---|---|---|---|
| 1 | `src/collections/Necesidades.ts` | `costo_estimado` restringido a staff/directiva/admin | A01 |
| 2 | `src/collections/Becarios.ts` | `condicion_socioeconomica_verificada` restringido a staff/directiva/admin | A01 |
| 3 | `src/collections/FotosBecarios.ts` (nueva) + `Becarios.ts` | Foto pública condicionada al consentimiento vigente | A01 |
| 4 | `src/collections/Users.ts` | Mínimo de 8 caracteres para cualquier contraseña, no solo en cambio de contraseña | A02/A07 |
| 5 | `next.config.ts` | `poweredByHeader: false` | A05 |
| 6 | `Caddyfile` | `Permissions-Policy` restrictiva | A05 |
| 7 | `package.json` | `next` 16.2.7 → 16.2.12 | A06 |
| 8 | `package.json` | `sharp` 0.34.2 → 0.35.3 | A06 |
| 9 | `pnpm-workspace.yaml` | Overrides de `postcss`/`dompurify`/`sharp` | A06 |

Todos verificados con `tsc --noEmit`, `eslint`, `pnpm build` (producción real) y `check:budget` limpios tras cada cambio. Los hallazgos #1–3 se probaron en vivo contra la API antes y después del fix (no solo leyendo el código).

## Pendientes que requieren tu decisión

1. **Actualizar Payload 3.82.1 → 3.87.0** — cierra el SQL injection de `drizzle-orm` (severidad alta) y la mayoría de los avisos de `undici`. Alcance mayor a lo que corresponde meter en esta auditoría; recomendado como el próximo bloque de trabajo, con su propia verificación dedicada.
2. **Content-Security-Policy** — mejora real de defensa en profundidad contra XSS, pero necesita probarse en staging antes de tocar el `Caddyfile` de producción (riesgo real de dejar `/admin` inaccesible si se arma mal).

Ninguno de los dos es explotable hoy de forma directa contra este sitio (el SQL injection de drizzle-orm requiere un vector que este código no expone; el XSS que la CSP mitigaría ya está cerrado en el código mismo). Ninguno bloquea la publicación, pero conviene resolverlos pronto después.
