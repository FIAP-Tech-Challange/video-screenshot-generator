FROM node:24 AS base
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

FROM base AS dev
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci && chown -R node:node /usr/src/app
COPY . .
EXPOSE ${PORT}
CMD ["npm", "run", "start:dev"]

FROM base AS builder
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci && chown -R node:node /usr/src/app
COPY . .
USER node
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --production
RUN apk add --no-cache curl
COPY --from=builder /usr/src/app/dist ./dist
USER node
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT}/api/health || exit 1
CMD ["node", "dist/main"]
