# 1 BUILDER STAGE
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# ---- Copy workspace-level files from ROOT context ----
COPY --from=root /package.json ./
COPY --from=root /pnpm-lock.yaml ./
COPY --from=root /pnpm-workspace.yaml ./

COPY --from=root /packages/common-backend ./packages/common-backend
COPY --from=root /packages/typescript-config ./packages/typescript-config

# ---- Copy service package.json ----
COPY --from=svc /package.json ./apps/ws-backend/package.json

# ---- Install dependencies (pnpm links workspaces → symlinks) ----
RUN pnpm install --frozen-lockfile

# ---- Copy the actual service source ----
COPY --from=svc / ./apps/ws-backend

# ---- Build (TS → JS) ----
# IMPORTANT: Use the correct package name from package.json
RUN pnpm --filter "@repo/ws-backend" run build


# 2 RUNTIME STAGE
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# ---- Copy node_modules from builder ----
COPY --from=builder /app/node_modules ./node_modules

# ---- Copy built JS files ----
COPY --from=builder /app/apps/ws-backend/dist ./dist

# ---- Copy service package.json for runtime ----
COPY --from=builder /app/apps/ws-backend/package.json ./package.json

EXPOSE 5000

CMD ["node", "dist/index.js"]
