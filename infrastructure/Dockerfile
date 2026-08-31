# Multi-stage production build for GEV-VERIFY Platform
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* bun.lock* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/validation/package.json ./packages/validation/
COPY packages/compliance-core/package.json ./packages/compliance-core/
COPY packages/config/package.json ./packages/config/

RUN npm install --legacy-peer-deps

# Copy source trees
COPY . .

# Build frontend and compile backend
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/uploads ./uploads

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
