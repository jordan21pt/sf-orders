FROM node:18-alpine AS builder
WORKDIR /usr/src/app

RUN apk add --no-cache git

COPY package*.json tsconfig.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

COPY src ./src
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
RUN apk add --no-cache git
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

CMD ["node","dist/server.js"]
