# Ciberseguridad — Plataforma Forum Foundation
### Documento 5 · Modelo de amenazas, controles y verificación

> Este documento se audita, no se lee. Cada control tiene una prueba asociada.
> Los marcados **[CRÍTICO]** bloquean el lanzamiento.

---

## 1. Qué estamos protegiendo

La plataforma no maneja dinero de terceros ni datos de salud, pero sí custodia información que puede dañar a personas concretas si se filtra.

| Activo | Sensibilidad | Daño si se expone |
|---|---|---|
| Documentación socioeconómica de becarios | **Máxima** | Estigmatización pública de una familia. Dato de vulnerabilidad |
| Historiales académicos y materias reprobadas | **Máxima** | Exposición de un fracaso académico ante su comunidad |
| Estado de suspensión | **Alta** | Igual que el anterior, en forma resumida |
| Fotografías de menores | **Alta** | Riesgo de seguridad infantil; incumplimiento legal |
| Datos de contacto de becarios | Alta | Suplantación, acoso |
| Calendario de desembolsos y montos | Media | Ingeniería social, presión sobre el becario |
| Credenciales de staff | **Máxima** | Compromiso total del sistema |
| Contenido público y mapa | Baja | Defacement, daño reputacional |

**Consecuencia de diseño:** el sistema tiene dos zonas con reglas distintas. Todo lo que toca el expediente de un becario se trata como confidencial por defecto y se publica solo por excepción explícita.

---

## 2. Modelo de amenazas

### Quién ataca esto realmente

Este no es un objetivo de espionaje dirigido. Los actores realistas son, en orden de probabilidad:

**1. Bots automatizados.** El 95% del tráfico hostil. Escanean CVEs conocidas, prueban credenciales filtradas, buscan paneles admin expuestos y endpoints de subida. No les importa qué sitio es.

**2. Ransomware oportunista.** Cifra la base de datos y los respaldos si están al alcance de la misma credencial. Es el escenario que puede acabar con el proyecto.

**3. Curioso local con contexto.** Alguien de la comunidad o de la universidad que quiere saber si Fulano perdió la beca. **Este es el atacante más peligroso para la privacidad**, porque conoce nombres y no necesita explotar nada: le basta con que la API devuelva de más.

**4. Ex miembro del staff.** Cuenta activa después de irse. Más frecuente de lo que se admite.

**5. Fuga por error propio.** Secreto en un commit, bucket mal configurado, GeoJSON con datos que no debían salir. **Estadísticamente, la causa más probable de un incidente en este proyecto.**

### Lo que NO es la amenaza principal

La propuesta original enfatizaba "aislamiento de red y firewall perimetral". Eso es correcto pero secundario: nadie va a atacar la red de este droplet. Van a atacar **la lógica de autorización de la aplicación** y **la configuración del almacenamiento**. Ahí es donde debe ir el esfuerzo.

---

## 3. Capa de aplicación — Payload y Next.js

### 3.1 Control de acceso — la frontera de seguridad real **[CRÍTICO]**

En Payload, el control de acceso **es** el modelo de seguridad. La interfaz no protege nada: la API REST y GraphQL exponen todo lo que las funciones de acceso permitan.

- [ ] **[CRÍTICO]** Ninguna colección queda con `access` por defecto. Todas lo declaran explícitamente, incluso las públicas
- [ ] **[CRÍTICO]** `Becarios.read` público filtra por `mostrar_en_mapa: true` **y además** restringe campos. Filtrar documentos sin filtrar campos deja expuesto el expediente completo de quien sí consintió
- [ ] Acceso a nivel de campo en: `nota_interna_evaluacion`, documentación socioeconómica, `motivo_suspension`, correo y teléfono del becario
- [ ] `Auditoria` con `create/update/delete: false` desde el panel; solo escribe el hook
- [ ] Colecciones con borradores: verificar que los no publicados no salen por la API pública

**Pruebas obligatorias, contra la API y sin sesión:**

```bash
# Debe devolver solo consentidos, sin campos privados
curl /api/becarios

# Debe devolver vacío o 403
curl /api/registros-academicos
curl /api/horas-labor-social
curl /api/desembolsos
curl /api/auditoria
curl /api/usuarios

# Traversal por relaciones: ¿se filtra el becario a través de la actividad?
curl "/api/actividades?depth=3"

# Filtrado por campo privado: ¿se puede inferir sin leerlo?
curl "/api/becarios?where[estado][equals]=suspendido"
```

> El último es sutil y peligroso. Aunque `estado` no se devuelva, si se puede **filtrar** por él, un atacante enumera quiénes están suspendidos comparando resultados. **El campo debe ser inconsultable para el público, no solo invisible.**

### 3.2 Aislamiento entre becarios (IDOR) **[CRÍTICO]**

- [ ] Becario A autenticado no obtiene nada de B por `GET /api/registros-academicos/{id-de-B}`
- [ ] Tampoco por consulta `where`, ni por `depth`, ni por GraphQL
- [ ] Un becario no puede modificar el campo `becario` de un registro propio para reasignarlo
- [ ] Un becario no puede cambiar su propio `estado`, `meta_horas_personalizada` ni `rol`
- [ ] Registros ya verificados quedan inmutables para el becario

> El vector clásico: el becario crea una hora de labor social apuntando a otro becario, o edita el `id` en la petición. Se prueba explícitamente.

### 3.3 Subida de archivos **[CRÍTICO]**

Los becarios suben documentos. Es la superficie de ataque más grande del portal.

- [ ] Lista blanca de tipos: PDF, JPG, PNG. Nada más
- [ ] Validación por **contenido real** (magic bytes), no por extensión ni por `Content-Type` declarado
- [ ] Límite de tamaño en la aplicación **y** en Caddy (`max_size 25MB`)
- [ ] Nombres de archivo saneados y regenerados; nunca se usa el nombre del cliente
- [ ] SVG **prohibido** en subidas de usuario — permite JavaScript embebido
- [ ] Archivos servidos con `Content-Disposition: attachment` y `X-Content-Type-Options: nosniff`
- [ ] Los documentos nunca se sirven desde el mismo origen que la app, para que un HTML malicioso no herede la sesión

### 3.4 Separación de buckets **[CRÍTICO]**

**Este es el error de arquitectura más probable del proyecto.**

El bucket de medios necesita ser público para que el CDN sirva las fotos. Si los historiales académicos van al mismo bucket, **quedan accesibles por URL sin autenticación alguna**. Nadie lo nota hasta que alguien comparte un enlace.

```text
forum-media       público  + CDN   → fotos, portadas, galerías
forum-docs        PRIVADO          → historiales, evidencias, consentimientos
forum-backups     PRIVADO          → pg_dump, con versionado
```

- [ ] Tres buckets separados, con **credenciales distintas** cada uno
- [ ] `forum-docs` se sirve solo por URL firmada de vigencia corta (5–15 min), generada tras verificar el acceso en la aplicación
- [ ] Verificado manualmente: pegar la URL directa de un documento en una ventana privada debe fallar
- [ ] CORS de cada bucket restringido al dominio del sitio

**Decisión del fundador (2026-08-04): riesgo aceptado por presupuesto, mientras no exista droplet.** En vez de los tres buckets separados, medios/documentos/respaldos van a vivir juntos en el disco del mismo VPS. El control de acceso a nivel de aplicación (quién puede *leer* cada documento, ya resuelto en el `access` de cada colección de Payload) no depende de esto y sigue siendo correcto igual. Lo que sí se pierde sin buckets separados es la resiliencia si ese VPS específico falla o se compromete — un respaldo que vive en el mismo disco que respalda no es un respaldo real. **Compromiso explícito para cerrar esa brecha concreta, no todo el ítem:** los respaldos (`pg_dump`) van a copiarse fuera del droplet — servidor personal en casa o un disco en la nube, todavía sin definir cuál — antes de considerar el respaldo real y no solo nominal. Reemplaza la obligatoriedad `[CRÍTICO]` de este punto mientras dure esa decisión; ver `docs/plan.md` Fase 1.

### 3.5 El GeoJSON público **[CRÍTICO]**

El mapa se sirve como archivo estático. Es un archivo público, sin autenticación, cacheado por el CDN.

- [ ] El filtro de consentimiento se aplica **en el generador**, nunca en el frontend
- [ ] El GeoJSON contiene únicamente los campos publicables: nombre, comunidad, universidad, carrera, foto, cita
- [ ] **No contiene**: estado, correo, teléfono, condición socioeconómica, notas internas, identificadores internos reutilizables
- [ ] Coordenadas de comunidad, nunca de domicilio
- [ ] Prueba de regresión en CI: si el GeoJSON incluye un campo fuera de la lista blanca, falla la build
- [ ] Al revocar un consentimiento, el archivo se regenera y **se purga la caché del CDN**

> Un consentimiento revocado que sigue en la caché de un CDN durante días es un incumplimiento de la Ley 81, no un detalle técnico.

### 3.6 Autenticación

- [x] 2FA TOTP disponible para todos los roles, opcional para todos — decisión del fundador (2026-07-30) de no forzarlo en admin/staff/directiva; ver `docs/plan.md` Fase 3 Paso H
- [ ] Contraseña mínima de 12 caracteres, contrastada contra listas de filtradas
- [ ] Bloqueo por intentos fallidos (`maxLoginAttempts`, `lockTime` en Payload)
- [ ] Límite de tasa en `/api/users/login` y en recuperación de contraseña
- [ ] **Respuestas idénticas** existan o no la cuenta, en login y en recuperación — evita enumerar becarios
- [ ] Tokens de recuperación de un solo uso, vigencia máxima de 1 hora
- [ ] Alta de becarios por invitación con enlace caduco. Sin autorregistro
- [ ] Cookies `httpOnly`, `secure`, `sameSite: lax`
- [ ] Sesión corta para staff y directiva; larga para becarios
- [ ] `PAYLOAD_SECRET` de 32+ bytes aleatorios, distinto en staging y producción
- [ ] Ningún usuario semilla o de prueba llega a producción

### 3.7 Inyección y ejecución

- [ ] SQL: Payload usa Drizzle con consultas parametrizadas. **Cualquier consulta cruda que se escriba debe parametrizarse** — auditar `scripts/` en particular
- [ ] XSS: el contenido Lexical se renderiza con el serializador oficial, nunca `dangerouslySetInnerHTML` sobre entrada de usuario
- [ ] El texto libre del staff no se interpreta como HTML
- [ ] SSRF: `next.config.js` con `remotePatterns` restringido al CDN propio y a `img.youtube.com`. **Nunca comodín**
- [ ] Ninguna función descarga una URL provista por el usuario sin lista blanca
- [ ] Prototype pollution: validar cuerpos JSON contra esquema, no confiar en `depth` o `where` arbitrarios del cliente

### 3.8 GraphQL

- [ ] Si no se usa en el frontend, **desactivarlo**: es superficie gratis
- [ ] Si se usa: introspección apagada en producción, límite de profundidad y de complejidad

### 3.9 Cabeceras y CSP

**Implementada y verificada 2026-08-04** (`src/proxy.ts`) — el ejemplo original de esta sección se ajustó en dos puntos no negociables, descubiertos al construirla de verdad en vez de copiar el texto:

1. **`script-src 'self'` a secas rompe Next.js App Router.** El framework inyecta `<script>` inline para el streaming de React Server Components (`self.__next_f.push(...)`) — sin ellos no hay hidratación, el sitio entero queda sin JS. Next 13.4+ soporta nonce por request detectado solo desde el header `Content-Security-Policy` de salida (`getScriptNonceFromHeader`), aplicado automáticamente a su propio JS sin tocar `layout.tsx`. Usado acá: `script-src 'self' 'nonce-<random-por-request>' 'strict-dynamic'`.
2. **`worker-src 'self' blob:'` — el `blob:` no hace falta en este código.** `ImpactoMap.tsx` ya evita el worker de MapLibre basado en `blob:` (`setWorkerUrl('/maplibre-gl-worker.mjs')`, un archivo propio servido desde `/public`) — confirmado sin violaciones con `worker-src 'self'` solo.

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-<random>' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';    # nonces no cubren atributos style="" inline (style={{}} en 11 archivos + admin de Payload)
  img-src 'self' data: https://i.ytimg.com;
  font-src 'self';                     # next/font autohospeda Google Fonts, sin red externa
  connect-src 'self' https://api.maptiler.com https://a.basemaps.cartocdn.com https://b.basemaps.cartocdn.com https://c.basemaps.cartocdn.com;
  worker-src 'self';
  frame-src https://www.youtube-nocookie.com;
  object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
  upgrade-insecure-requests;
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

`img-src` todavía no incluye `https://*.digitaloceanspaces.com`: los medios siguen en disco local (sin adaptador S3 todavía, ver [[🛡️ Ciberseguridad & No-Negociables]] §Aislamiento de Almacenamiento) — agregar el dominio real de Spaces es parte de esa migración pendiente, no de esta tarea.

- [x] CSP construida y verificada contra un build de producción real (`node .next/standalone/server.js`, `NODE_ENV=production`) — no solo contra `next dev`. **No se pasó por una fase `Report-Only` separada**: no hay infraestructura de reporting (`report-uri`/`report-to`) ni visitantes reales que la alimenten todavía (sin droplet desplegado), así que un Report-Only silencioso no habría aportado más que la verificación directa que sí se hizo: cada directiva probada en ambos sentidos (dominio real permitido, dominio inventado bloqueado) con el evento `securitypolicyviolation` del navegador, sobre las páginas reales que usan cada recurso (mapa completo, iframe de YouTube, login de `/admin` y `/portal`).
- [ ] Verificada en securityheaders.com — pendiente de que exista un dominio público desplegado (no aplica en local/staging sin DNS real, ver runbook §12).

### 3.10 Límite de tasa

- [x] **Login, 2FA, recuperación/reset de contraseña y activación por invitación (2026-08-04).** Todo lo que vive bajo `/api/users/*`, limitado a nivel de red en Caddy (30 pedidos/minuto por IP, plugin community `caddy-ratelimit` vía `Dockerfile.caddy` — Caddy oficial no trae rate limiting). Es una capa **adicional** al bloqueo de 5 intentos por cuenta que ya aplica Payload (§3.1) — esa protege una cuenta puntual, esta frena el volumen agregado por IP antes de que llegue a la aplicación. Verificado contra el servidor real: 31 pedidos seguidos a `/api/users/login` dan `401` (credenciales inválidas, comportamiento normal) en los primeros 30 y `429` en el 31º.
- [ ] Formulario público de Necesidades — protegido contra spam sin CAPTCHA invasivo (honeypot ya implementado, ver `docs/plan.md` Fase 3 §3.5 "Página pública `/impacto/necesidades`"), **límite por IP todavía no**
- [ ] API pública, para evitar el raspado masivo del padrón consentido

---

## 4. Secretos y cadena de suministro

- [ ] **[CRÍTICO]** `.env` en `.gitignore` desde el primer commit
- [ ] Escaneo de secretos en CI (`gitleaks` o similar) que **bloquee** el merge
- [ ] Historial de Git auditado antes de publicar el repositorio: un secreto en un commit viejo sigue ahí aunque el archivo se haya borrado
- [ ] Credenciales rotadas si alguna vez tocaron el repositorio
- [ ] Clave de MapTiler restringida por dominio — es visible en el navegador, no se puede ocultar
- [ ] `pnpm-lock.yaml` versionado; instalaciones con `--frozen-lockfile`
- [ ] Dependabot o Renovate activo
- [ ] `pnpm audit` en CI
- [ ] Imágenes Docker fijadas por digest, no por etiqueta `latest`
- [ ] Escaneo de la imagen con Trivy antes de desplegar
- [ ] Revisión manual antes de agregar cualquier dependencia nueva: quién la mantiene y cuándo fue el último commit

> **Riesgo estructural: mantenedor único.** No hay revisión de código por pares. Mitigación: escaneo automático estricto en CI y una revisión de seguridad externa antes del lanzamiento.

---

## 5. Infraestructura

### 5.1 Servidor

- [ ] SSH solo por llave; `PermitRootLogin no`, `PasswordAuthentication no`
- [ ] Usuario `deploy` sin privilegios; `sudo` con contraseña
- [ ] `ufw`: solo 22, 80, 443. Considerar restringir 22 a IPs conocidas
- [ ] Firewall de DigitalOcean como segunda capa, en el borde
- [ ] `fail2ban` sobre SSH
- [ ] `unattended-upgrades` para parches de seguridad
- [ ] Llave SSH de CI **distinta** de la personal, con acceso mínimo, revocable

### 5.2 Docker

- [ ] Contenedores corriendo como usuario no-root
- [ ] `read_only: true` donde sea posible, con `tmpfs` para lo temporal
- [ ] `cap_drop: [ALL]`, agregando solo lo necesario
- [ ] Sin `privileged`, sin montar el socket de Docker en ningún contenedor
- [ ] Límites de memoria y CPU declarados — contiene un DoS accidental
- [ ] Imagen base `alpine` o `slim`, reconstruida al menos mensualmente

### 5.3 PostgreSQL

- [ ] **[CRÍTICO]** Sin puertos publicados al host. Solo alcanzable por la red interna de Docker
- [ ] Usuario de aplicación distinto de `postgres`, con permisos mínimos
- [ ] Contraseña larga y aleatoria
- [ ] Volumen persistente con permisos restringidos
- [ ] Verificación externa: `nmap -p 5432` desde fuera no debe responder

### 5.4 TLS

- [ ] Caddy con emisión automática y renovación verificada
- [ ] TLS 1.2 mínimo, preferiblemente 1.3
- [ ] HSTS activo
- [ ] Alerta de expiración de certificado como red de seguridad

---

## 6. Respaldos y resiliencia ante ransomware

El escenario que puede matar el proyecto: alguien compromete el servidor, cifra la base **y borra los respaldos con las mismas credenciales**.

- [ ] **[CRÍTICO]** El bucket de respaldos usa credenciales propias, con permiso de **escritura pero no de borrado**
- [ ] Versionado de objetos activado
- [ ] Retención: 30 diarios, 12 mensuales
- [ ] Al menos una copia fuera de DigitalOcean — si se compromete la cuenta, se pierde todo lo que viva ahí
- [ ] Respaldos cifrados en reposo
- [ ] Alerta si el respaldo diario no se ejecutó. Un cron silencioso es el peor de los mundos
- [ ] **[CRÍTICO]** Restauración probada en entorno limpio antes del lanzamiento, y cada seis meses
- [ ] Tiempo de restauración medido y anotado en el runbook

---

## 7. Registro, monitoreo y detección

- [ ] Auditoría de aplicación sobre: cambios de estado del becario, verificaciones académicas, aprobación de horas, desembolsos, cambios de rol, inicios de sesión fallidos y exitosos de staff
- [ ] **Los registros no contienen datos personales innecesarios** — un log filtrado es una brecha
- [ ] Rotación de logs configurada; el disco lleno es una caída de servicio
- [ ] Alertas: picos de 401/403, subidas anómalas, disco > 80%, caída del respaldo
- [ ] Monitoreo de disponibilidad externo (UptimeRobot o similar)
- [ ] Analítica sin cookies ni identificadores personales (Plausible o Umami autoalojado)

---

## 8. Cumplimiento — Ley 81 de 2019

- [ ] Registro de tratamientos: qué datos, para qué, cuánto tiempo, quién accede
- [ ] Base legal documentada para cada categoría; consentimiento explícito para publicación de imagen y datos
- [ ] Política de privacidad publicada, bilingüe, en lenguaje claro
- [ ] Procedimiento para ejercer derechos de acceso, rectificación, cancelación y oposición, con responsable y plazo definidos
- [ ] **Revocación de consentimiento efectiva**: el becario la ejecuta desde su portal, el GeoJSON se regenera y la caché del CDN se purga
- [ ] Política de retención: qué pasa con el expediente de un becario graduado o retirado, y a los cuántos años se elimina o anonimiza
- [ ] Consentimiento de acudientes para fotografías de menores, archivado y verificable
- [ ] Encargados de tratamiento identificados: DigitalOcean, MapTiler, YouTube, proveedor de correo
- [ ] Procedimiento de notificación de brecha, con plazo y destinatarios definidos **antes** de necesitarlo

---

## 9. Terceros

| Servicio | Riesgo | Control |
|---|---|---|
| YouTube incrustado | Rastreo de estudiantes menores | `youtube-nocookie.com` + carga diferida tras clic |
| MapTiler | Clave visible en el navegador | Restricción por dominio; alerta de consumo |
| DigitalOcean Spaces | Bucket mal configurado | Auditoría de ACL; verificación manual periódica |
| Correo transaccional | Suplantación del dominio | SPF, DKIM y DMARC configurados |
| Analítica | Recolección excesiva | Sin cookies, sin identificadores |

---

## 10. Factor humano

Es donde ocurre la mayoría de los incidentes reales.

- [ ] Capacitación al staff: phishing, contraseñas, no compartir cuentas
- [ ] **Una cuenta por persona.** Nunca una cuenta "staff" compartida — rompe la auditoría y la revocación
- [ ] Procedimiento de baja ejecutado el mismo día: desactivar cuenta, revocar 2FA, rotar credenciales compartidas
- [ ] Bloqueo de pantalla y cifrado de disco en los equipos del staff
- [ ] Prohibido enviar documentos de becarios por WhatsApp o correo personal — para eso existe el portal
- [ ] Contacto claro para reportar algo sospechoso, sin miedo a represalias

---

## 11. Plan de respuesta a incidentes

Escrito **antes** de necesitarlo, en `docs/respuesta-incidentes.md`.

1. **Detectar y contener** — aislar el servidor, no apagarlo: se pierde la evidencia en memoria
2. **Preservar** — snapshot del droplet y copia de logs antes de tocar nada
3. **Erradicar** — rotar todos los secretos, cerrar sesiones, reconstruir desde imagen limpia
4. **Recuperar** — restaurar desde el último respaldo verificado como bueno
5. **Notificar** — a la directiva siempre; a los afectados y a la autoridad si hubo datos personales
6. **Aprender** — postmortem escrito, sin buscar culpables

- [ ] Contactos definidos: quién decide, quién ejecuta, quién comunica
- [ ] Credenciales de emergencia accesibles aunque el sistema esté caído

---

## 12. Verificación antes del lanzamiento

**Bloquean el lanzamiento:**

- [ ] Suite de pruebas de acceso de la sección 3.1 pasando completa
- [ ] IDOR entre becarios probado y negativo
- [ ] Documentos privados inaccesibles por URL directa
- [ ] GeoJSON auditado campo por campo
- [x] 2FA funcionando (opcional para todos los roles — decisión del fundador, no forzado)
- [ ] Postgres no alcanzable desde internet
- [ ] Sin secretos en el historial de Git
- [ ] Restauración de respaldo probada
- [ ] `pnpm audit` sin vulnerabilidades altas o críticas
- [ ] Cabeceras verificadas externamente

**Recomendado:**

- [ ] Escaneo con OWASP ZAP en modo pasivo
- [ ] Revisión por una segunda persona del control de acceso — es lo que compensa la ausencia de revisión por pares
- [ ] Prueba de carga básica para conocer el punto de saturación

---

## 13. Los cinco riesgos que más importan

Si solo hubiera tiempo para cinco cosas, son estas:

1. **Documentos de becarios en un bucket público.** Fuga total y silenciosa. Se resuelve con separación de buckets y URLs firmadas.
2. **Control de acceso incompleto en la API.** La interfaz oculta, la API entrega. Se resuelve probando contra `/api/` y no contra el navegador.
3. **Respaldos borrables con la credencial comprometida.** Convierte un incidente recuperable en una pérdida total.
4. **GeoJSON con campos de más.** Publica sin auditoría lo que estaba protegido en la base.
5. **Cuenta de staff activa después de la salida.** El acceso más fácil que existe, y no requiere habilidad técnica.

---

*Documento de seguridad — se revisa en cada cambio de arquitectura y al menos una vez al año.*
