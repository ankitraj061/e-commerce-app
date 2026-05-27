# ── Backend Dockerfile ────────────────────────────────────────────────────────
# Three-stage build:
#   1. deps    — install production-only node_modules
#   2. builder — install all deps, generate Prisma client, compile TypeScript
#   3. runner  — lean production image (prod deps + compiled JS + prisma client)

# ── Stage 1: Production deps ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
# Generate Prisma client (needed before tsc so imports resolve)
RUN npx prisma generate
RUN npm run build

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Overlay the generated Prisma client (native binaries) from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled JS output
COPY --from=builder /app/dist ./dist

# Copy package.json so `npm start` can resolve "main"
COPY package.json ./

EXPOSE 8000
CMD ["node", "dist/index.js"]
