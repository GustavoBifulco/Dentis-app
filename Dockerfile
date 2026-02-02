# Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera o build do Vite (front) e do Esbuild (server) conforme seu package.json
RUN npm run build

# Estágio de Produção
FROM node:20-alpine

WORKDIR /app

# Copia apenas os builds e dependências necessárias
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Define a porta padrão
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar o servidor Hono que você definiu no package.json
CMD ["npm", "run", "start"]