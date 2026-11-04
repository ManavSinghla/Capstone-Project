FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY src ./src

RUN mkdir -p storage/uploads

EXPOSE 5000

CMD ["node", "src/server.js"]

