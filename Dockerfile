# Multi-stage Dockerfile for Project Zenith

# --- Base Stage ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# --- Build Backend Stage ---
FROM base AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

# --- Build Frontend Stage ---
FROM base AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY next.config.js tsconfig.json postcss.config.js tailwind.config.ts components.json ./
COPY app ./app
COPY components ./components
COPY constants ./constants
COPY hooks ./hooks
COPY public ./public
COPY services ./services
COPY store ./store
COPY types ./types
COPY utils ./utils
RUN npm run build

# --- Backend Runner ---
FROM base AS backend
WORKDIR /app/server
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm ci --only=production
COPY --from=backend-builder /app/server/dist ./dist
COPY server/data ./data
EXPOSE 5001
CMD ["npm", "start"]

# --- Frontend Runner ---
FROM base AS frontend
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/.next ./.next
COPY next.config.js postcss.config.js tailwind.config.ts ./
EXPOSE 3000
CMD ["npm", "run", "start"]
