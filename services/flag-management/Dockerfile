FROM node:20.18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src src
COPY migrations migrations

RUN npm ci
RUN npm run build-prod
RUN npm run typeorm:migrate

CMD ["npm", "run", "start-prod"]
