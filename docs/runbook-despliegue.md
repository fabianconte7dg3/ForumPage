# Runbook de despliegue — actualizaciones, features y fixes

Guía práctica de cómo llevar un cambio de código local a producción. Verificada de punta a punta el 2026-08-04 contra un droplet real (AWS EC2, Ubuntu 26.04), no es un procedimiento aspiracional.

Complementa a [03-runbook-tecnico.md](../03-runbook-tecnico.md) §11-14 (arquitectura del servidor, Dockerfile, Caddy) — este documento es el **día a día**: qué correr cuando ya existe un servidor y hay que subirle un cambio.

## 1. Flujo normal de un cambio (código local)

Esto no cambia respecto a como se viene trabajando todo el proyecto:

1. Cambios chicos y atómicos (1 a 10 archivos), nunca "reescribir todo".
2. Antes de cada commit: `pnpm tsc --noEmit`, `pnpm lint`, y si el cambio es visible en el sitio, un build de producción real (`pnpm build`, no solo `next dev`) + `pnpm check:budget`.
3. Si el cambio agrega o modifica un campo/colección de Payload: generar la migración contra el Postgres de dev (`pnpm payload migrate:create <nombre>`) y commitearla junto con el código — nunca se despliega a producción sin su migración ya generada.
4. `git commit` (nunca sin que el usuario lo pida explícitamente) → `git push` a `main`. Si el cambio se hizo en una rama/sesión aparte, mergear como fast-forward cuando sea posible, revisando el diff antes.
5. CI (`.github/workflows/ci.yml`) corre lint/typecheck/build/budget en cada push — pero **no despliega**. El despliegue real a un servidor sigue siendo manual (`scripts/deploy.sh`, sección 3), porque no hay droplet fijo/permanente todavía — ver `docs/plan.md` sobre el VPS actual.

## 2. El hueco real del Dockerfile — por qué las migraciones no son un simple `docker compose exec`

`03-runbook-tecnico.md` §12.4 documentaba `docker compose exec app pnpm payload migrate` como el comando para migrar. **No funciona contra la imagen real** — el contenedor final (`runner`, la salida `standalone` de Next.js) no incluye el CLI de Payload ni `node_modules/payload`, porque el *tracing* de Next.js solo empaqueta lo necesario para servir HTTP, no las herramientas de CLI. Esto no es un bug a corregir haciendo la imagen final más pesada (el punto de `standalone` es justamente una imagen mínima) — es correcto que el contenedor que sirve tráfico público no cargue con herramientas de administración que no necesita.

**La forma real de migrar:** construir la etapa intermedia del Dockerfile (`build`, que sí tiene el `node_modules` completo) como su propia imagen, y correr `pnpm payload migrate` ahí, conectado a la misma red de Docker que el `db` real — nunca contra el contenedor `runner`. `scripts/deploy.sh --migrate` ya hace esto.

## 3. Desplegar con `scripts/deploy.sh`

```bash
DEPLOY_HOST=<ip-del-vps> DEPLOY_USER=ubuntu DEPLOY_KEY=/ruta/a/la/clave.pem ./scripts/deploy.sh
```

Qué hace, en orden (incluye reconstruir Caddy si `Dockerfile.caddy` o el `Caddyfile` cambiaron — no hace falta ningún flag extra, `docker compose up -d --build` reconstruye cualquier servicio con `build:` en el compose):
1. `rsync` del código local al VPS (excluye `node_modules/`, `.next/`, `.git/`, `.env`, medios subidos y todo lo que ya excluye `.gitignore` — nunca pisa el `.env` real del servidor).
2. Si se pasa `--migrate`: construye la imagen del stage `build` y corre las migraciones pendientes contra el Postgres real, **antes** de tocar el contenedor que sirve tráfico (para no dejar nunca código nuevo corriendo contra un esquema viejo).
3. `docker compose up -d --build`: reconstruye la imagen final y reemplaza el contenedor `app` — `db` y `caddy` no se tocan si no cambiaron.
4. Imprime el estado final de los tres contenedores para confirmar a simple vista.

**Cuándo usar `--migrate`:** únicamente si el cambio agrega archivos nuevos en `src/migrations/` (colección o campo nuevo). Un fix de UI o de texto no lo necesita — el deploy sin `--migrate` es más rápido porque se salta el build de la imagen intermedia.

**Variables:**
- `DEPLOY_HOST`/`DEPLOY_USER`/`DEPLOY_KEY`: obligatorias, sin default (nada hardcodeado al VPS actual — cambia si el droplet cambia).
- `DEPLOY_PATH`: opcional, default `~/forumpage`.

## 4. Verificación post-deploy (siempre, sin excepción)

```bash
curl -sD - -o /dev/null https://<dominio>/es       # 200, header content-security-policy presente
curl -s -o /dev/null -w "%{http_code}\n" https://<dominio>/admin
curl -s https://<dominio>/api/comunidades           # responde JSON, no 500
```

Si el cambio tocó algo visible (nueva página, componente, texto), confirmarlo también con el navegador real, no solo con `curl` — un 200 no garantiza que el contenido sea el correcto.

## 5. Si algo sale mal — rollback

No hay todavía un registro de imágenes versionadas (`ghcr.io/...:v1.2.3` como sugiere `03-runbook-tecnico.md` §14.1) — mientras tanto, el rollback es:

1. `git revert <commit-problemático>` en local, o `git checkout <commit-bueno-anterior> -- .` si es más rápido para un fix urgente.
2. Correr `scripts/deploy.sh` de nuevo (sin `--migrate` salvo que el commit bueno anterior también necesite un estado de esquema distinto — caso raro, pensarlo dos veces antes).
3. Verificar con el paso 4.

**Las migraciones nunca se revierten automáticamente.** Si un despliegue con `--migrate` salió mal, evaluar caso por caso — casi siempre es más seguro escribir una migración nueva que deshaga el cambio que intentar un `down()` contra una base que ya tiene datos reales.

## 6. Qué falta para que esto sea CI/CD real

Documentado a propósito como pendiente, no como un olvido — no tiene sentido automatizarlo hasta que el droplet sea permanente:

- Un GitHub Actions que corra `scripts/deploy.sh` en cada push a `main` (hoy es manual, a propósito, mientras el servidor destino pueda cambiar).
- Versionado de imágenes (`ghcr.io/.../plataforma:sha-1234`) en vez de reconstruir siempre `latest` — permite un rollback instantáneo sin reconstruir nada.
- Los tres buckets separados y respaldos fuera del droplet — ver [[🛡️ Ciberseguridad & No-Negociables]] / `05-ciberseguridad.md` §3.4, decisión de riesgo aceptado del 2026-08-04.

## Relacionado

- [docs/plan.md](plan.md) — historial de decisiones, incluida la del VPS actual.
- [03-runbook-tecnico.md](../03-runbook-tecnico.md) §11-14 — arquitectura de base (Dockerfile, Caddy, backups).
- [docs/manual-staff.md](manual-staff.md) — este runbook es para quien despliega código, no para el staff que administra contenido.
