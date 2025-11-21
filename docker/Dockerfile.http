# ------------------ BUILD STAGE ------------------
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependency files first (cache optimization)
COPY package*.json ./
RUN npm ci
# Copy source code
COPY . .
# Build TypeScript → dist
RUN npm run build
# ------------------ RUNNER STAGE ------------------
FROM node:20-alpine AS runner
WORKDIR /app
# Copy production node_modules
COPY --from=builder /app/node_modules ./node_modules
# Copy compiled JS files
COPY --from=builder /app/dist ./dist
# Set environment
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000