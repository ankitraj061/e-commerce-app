# Backend Dockerfile for BharatBazaar
# Multi-stage build: install dependencies + build in one stage, runtime in the second.

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies from package-lock for deterministic builds.
COPY package*.json ./
RUN npm ci

# Copy source files and generate Prisma client.
COPY . ./
RUN npx prisma generate

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy dependency metadata and install only production deps.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app from builder stage.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8000
CMD ["npm", "start"]
