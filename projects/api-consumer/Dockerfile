FROM node:22-alpine AS base
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

FROM base AS dev
ENV NODE_ENV=development
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci && chown -R node:node /usr/src/app
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM base AS builder
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci && chown -R node:node /usr/src/app
COPY . .
USER node
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev --production

RUN apk add --no-cache libc6-compat curl
COPY --from=builder /usr/src/app/dist ./dist
USER node
EXPOSE 3000

CMD ["node", "dist/main"]
