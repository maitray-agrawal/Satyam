# Multi-stage production build for GEV-VERIFY Platform (SIH 2026 PS 26100)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* bun.lock* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/validation/package.json ./packages/validation/
COPY packages/compliance-core/package.json ./packages/compliance-core/
COPY packages/config/package.json ./packages/config/

RUN npm install --legacy-peer-deps

# Copy application source files
COPY . .

# Build production assets (Vite SPA + Node server bundle)
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy application manifest, bundled code, dependencies, and seed data
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Create runtime directories for document uploads and local SQLite storage
RUN mkdir -p /app/uploads /app/data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
