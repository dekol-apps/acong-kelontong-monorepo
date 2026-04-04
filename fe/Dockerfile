FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG FE_API_URL=https://domain.com/api
ARG FE_ENCRYPTION_KEY=1234
RUN sed -i "s|https://domain.com/api|${FE_API_URL}|g" src/environments/environment.prod.ts \
  && sed -i "s|ENCRYPTION_KEY: '1234'|ENCRYPTION_KEY: '${FE_ENCRYPTION_KEY}'|g" src/environments/environment.prod.ts
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/acong-kelontong-monorepo-fe/server/server.mjs"]
