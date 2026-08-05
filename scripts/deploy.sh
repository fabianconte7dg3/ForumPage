#!/bin/bash
# Despliega el código local a un VPS real vía rsync + Docker Compose.
# Formaliza el proceso verificado a mano el 2026-08-04 contra un droplet de
# AWS real — ver docs/runbook-despliegue.md para la guía completa.
#
# Uso:
#   DEPLOY_HOST=1.2.3.4 DEPLOY_USER=ubuntu DEPLOY_KEY=~/clave.pem ./scripts/deploy.sh
#   DEPLOY_HOST=... DEPLOY_USER=... DEPLOY_KEY=... ./scripts/deploy.sh --migrate
#
# --migrate: agregalo cuando el cambio incluye una migración nueva en
# src/migrations/ (colección o campo nuevo). Sin --migrate, el deploy solo
# reconstruye y reinicia la app — más rápido, para fixes/features que no
# tocan el esquema de la base.
set -euo pipefail

: "${DEPLOY_HOST:?falta DEPLOY_HOST (ej. 3.91.207.65)}"
: "${DEPLOY_USER:?falta DEPLOY_USER (ej. ubuntu)}"
: "${DEPLOY_KEY:?falta DEPLOY_KEY (ruta al .pem, ej. ~/vps/clave.pem)}"
DEPLOY_PATH="${DEPLOY_PATH:-~/forumpage}"

REMOTO="$DEPLOY_USER@$DEPLOY_HOST"
SSH=(ssh -i "$DEPLOY_KEY" -o ConnectTimeout=10 "$REMOTO")

echo "→ Copiando código a $REMOTO:$DEPLOY_PATH ..."
rsync -az --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.pnpm-store/' \
  --exclude='media/' \
  --exclude='documentos-privados/' \
  --exclude='fotos-becarios/' \
  --exclude='ForumOldPageInfo/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='!.env.example' \
  --exclude='!.env.staging.example' \
  --exclude='public/maplibre-gl-worker.mjs' \
  --exclude='public/maplibre-gl-shared.mjs' \
  --exclude='obsidian/' \
  -e "ssh -i $DEPLOY_KEY" \
  ./ "$REMOTO:$DEPLOY_PATH/"

if [[ "${1:-}" == "--migrate" ]]; then
  echo "→ Corriendo migraciones (imagen separada del stage 'build' — el"
  echo "  contenedor que sirve tráfico no trae el CLI de Payload a propósito,"
  echo "  para mantener la imagen final mínima)..."
  "${SSH[@]}" "cd $DEPLOY_PATH && \
    docker build --target build -t forumpage-buildstage . && \
    docker run --rm --network forumpage_default --env-file .env forumpage-buildstage \
      sh -c 'printf y\n | pnpm payload migrate'"
fi

echo "→ Reconstruyendo y reiniciando la app..."
"${SSH[@]}" "cd $DEPLOY_PATH && docker compose -f docker-compose.staging.yml --env-file .env up -d --build"

echo "→ Estado final:"
sleep 5
"${SSH[@]}" "docker compose -f $DEPLOY_PATH/docker-compose.staging.yml ps"
