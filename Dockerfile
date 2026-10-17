ARG NODE_VERSION=22-bookworm-slim
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8000

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist         ./dist
COPY --chown=node:node package.json ./
 
USER node
 
EXPOSE 8000
 
CMD ["node", "dist/main.js"]

