# Multi-stage Dockerfile for Next.js

ARG NODE_VERSION=20
ARG JWTSECRET=dummy-secret
ARG DB_HOST=db
ARG DB_PORT=3306
ARG DB_USER=root
ARG DB_PASSWORD=root
ARG DB_NAME=test_cursor

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential ca-certificates git && \
    rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS builder

# -------- ADD THESE ARGs --------
ARG JWTSECRET
ARG DB_HOST
ARG DB_PORT
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
# --------------------------------

ENV NODE_ENV=production \
    JWTSECRET=$JWTSECRET \
    DB_HOST=$DB_HOST \
    DB_PORT=$DB_PORT \
    DB_USER=$DB_USER \
    DB_PASSWORD=$DB_PASSWORD \
    DB_NAME=$DB_NAME

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
