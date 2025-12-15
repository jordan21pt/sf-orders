FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Bring in shared messaging package so the local file: dependency can be installed
COPY services/shared/messaging ./services/shared/messaging
# Copy the entire service (package files, src, prisma, etc.)
COPY services/sf-orders ./services/sf-orders

WORKDIR /usr/src/app/services/sf-orders
RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Shared package needed for file: dependency resolution during npm ci
COPY services/shared/messaging ./services/shared/messaging
COPY services/sf-orders/package*.json services/sf-orders/tsconfig.json ./services/sf-orders/

WORKDIR /usr/src/app/services/sf-orders
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/services/sf-orders/dist ./dist
COPY --from=builder /usr/src/app/services/sf-orders/prisma ./prisma
COPY --from=builder /usr/src/app/services/sf-orders/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/services/sf-orders/node_modules/@prisma ./node_modules/@prisma

CMD ["node","dist/server.js"]
