FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# BUILDER STAGE
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter ws-backend run build

# Isolate production dependencies
RUN pnpm --filter ws-backend --prod deploy /prod/ws-backend

# RUNNER STAGE
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=builder --chown=nodejs:nodejs /prod/ws-backend /app
COPY --from=builder --chown=nodejs:nodejs /app/apps/ws-backend/dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.js"]