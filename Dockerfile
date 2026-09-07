# BIRD ACADEMY ENTERPRISE — LMSE BACKEND PRODUCTION DOCKERFILE
# Node.js 22 Alpine Base Image
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build Admin application
RUN npm run build:admin

# Build User application
RUN npm run build:user

# Production Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV VITE_APP_MODE=admin

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and server scripts
COPY --from=builder /app/dist_admin ./dist_admin
COPY --from=builder /app/dist_user ./dist_user
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
COPY --from=builder /app/data ./data

EXPOSE 3001

# Persistent storage volume for data
VOLUME [ "/app/data" ]

# Launch LMSE Production Server
CMD ["node", "--import", "tsx", "scripts/startAdminProdServer.js"]
