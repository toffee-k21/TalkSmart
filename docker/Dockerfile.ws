FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1️⃣ BUILDER STAGE
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

# Compile TS -> JS
RUN pnpm --filter ws-backend run build

# Isolate production dependencies
RUN pnpm --filter ws-backend --prod deploy /prod/ws-backend

# 2️⃣ RUNNER STAGE
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Copy the folder that has the FRESH generated client
COPY --from=builder --chown=nodejs:nodejs /prod/ws-backend /app

# Copy the compiled code
COPY --from=builder --chown=nodejs:nodejs /app/apps/ws-backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]