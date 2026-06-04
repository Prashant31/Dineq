FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./server/prisma/schema.prisma

EXPOSE 5000

WORKDIR /app/server

CMD ["node", "server.js"]