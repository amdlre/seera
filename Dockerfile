# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time-only placeholders so `next build` can validate env.ts without
# requiring the real production secrets (they are supplied at deploy time).
# These fake values live only in this intermediate "builder" layer — the
# "runner" stage below copies just the standalone build output, never this
# layer, so nothing here reaches the shipped image. Docker's linter still
# flags ENV+"SECRET"/"KEY" names generically; see docs/DECISIONS.md.
ENV DATABASE_URL="postgres://user:pass@localhost:5432/db"
ENV JWT_SECRET="build-time-placeholder-secret-32-characters-min"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV SMTP_HOST="localhost"
ENV SMTP_PORT="1025"
ENV MAIL_FROM="noreply@example.com"

RUN npm run build && npm run build:migrate

# ---- Runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Chromium (headless PDF rendering, ATS-CRITERIA §2) + Arabic/CJK fonts so
# `local("Noto Naskh Arabic")` in print.css resolves on the server.
RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium fonts-noto-core fonts-noto-cjk \
  && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Self-contained migration runner + SQL files, applied on every container start.
COPY --from=builder --chown=nextjs:nodejs /app/dist/migrate.cjs ./migrate.cjs
COPY --from=builder --chown=nextjs:nodejs /app/src/db/migrations ./migrations
ENV MIGRATIONS_DIR=/app/migrations

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# node:*-slim ships no curl, so probe with Node's built-in fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrate first; if it fails the container exits instead of serving a stale schema.
# `exec` hands PID 1 to Node so stop signals reach the server.
CMD ["sh", "-c", "node migrate.cjs && exec node server.js"]
