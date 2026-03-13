FROM node:20-alpine AS dev
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 4200

# Proxy para Docker: /api -> api-bff:3000 (usa proxy.conf.docker.json)
# Force binding to all interfaces with --host and --port
# Use dev-server configuration directly to ensure 0.0.0.0 binding
CMD ["npx", "ng", "serve", "--configuration", "development", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check", "--proxy-config", "proxy.conf.docker.json", "--poll", "2000"]
