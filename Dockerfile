# syntax=docker/dockerfile:1
# Build multietapa — ver 03-runbook-tecnico.md §12.1. Salida standalone de
# Next.js (ya activada en next.config.ts) para una imagen final mínima.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
# Versión fija de pnpm (la misma usada en desarrollo) en vez de corepack, que
# sin un campo "packageManager" en package.json descarga "latest" en cada
# build — no reproducible entre despliegues.
RUN npm install -g pnpm@11.3.0
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/public ./public
COPY . .
# Solo para que `payload build` pueda validar la config al construir la imagen
# — el valor real llega en runtime vía `env_file` en docker-compose y pisa
# estos placeholders (las server actions/componentes leen process.env en
# cada request, no quedan "horneados" como sí pasa con NEXT_PUBLIC_*).
ARG PAYLOAD_SECRET=build-placeholder
ARG DATABASE_URI=postgresql://build:build@localhost:5432/build
ARG NEXT_PUBLIC_SERVER_URL=https://staging.forum-foundation.org
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV DATABASE_URI=$DATABASE_URI
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
