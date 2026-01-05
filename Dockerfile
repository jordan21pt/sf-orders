# --- STAGE 1: Builder ---
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Instalar dependências necessárias para compilação
RUN apk add --no-cache git

COPY package*.json tsconfig.json ./
COPY prisma ./prisma

# Instalamos todas as dependências (incluindo devDependencies para o tsc)
RUN npm install

# Gerar o Prisma Client (necessário para o build do TS não dar erro de tipos)
RUN npx prisma generate

COPY src ./src
RUN npm run build

# --- STAGE 2: Runtime ---
FROM node:18-alpine AS runtime
WORKDIR /usr/src/app

RUN apk add --no-cache git
ENV NODE_ENV=production

# Copiar apenas o essencial para instalar dependências de produção
COPY package*.json ./
COPY prisma ./prisma

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# GERAR NOVAMENTE O PRISMA (Mudança Importante)
# Isto garante que os binários corretos para o Alpine são criados no stage final
RUN npx prisma generate

# Copiar o código compilado do builder
COPY --from=builder /usr/src/app/dist ./dist

# Comando de arranque (Verifica se é dist/src/server.js ou dist/server.js)
# Dica: Se no final do build o ficheiro está em dist/src/server.js, usa este:
CMD ["node", "dist/src/server.js"]