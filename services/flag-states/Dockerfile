FROM node:20.18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src src

RUN npm ci
RUN npm run build-prod

CMD ["npm", "run", "start-prod"]
