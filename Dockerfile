# Multi-stage Dockerfile for Next.js
#
# Targets:
# - base: common deps
# - deps: install npm deps
# - builder: build Next app
# - runner (default): production runtime

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential ca-certificates git && \
    rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./ 
RUN npm ci

FROM deps AS builder
ENV NODE_ENV=production
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
USER node
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]

