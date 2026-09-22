# ============================================
# SATYAM - Production Build
# ============================================

FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock ./

# Copy workspace package manifests
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/validation/package.json ./packages/validation/
COPY packages/compliance-core/package.json ./packages/compliance-core/
COPY packages/config/package.json ./packages/config/

# Install workspace dependencies
RUN bun install --frozen-lockfile

# Copy application source
COPY . .

# Build Vite frontend + Node server bundle
RUN bun run build


# ============================================
# Production Runtime
# ============================================

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production application
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Runtime directories
RUN mkdir -p /app/uploads /app/data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]