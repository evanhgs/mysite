ARG NODE_VERSION=24.12.0-alpine
ARG NGINX_VERSION=alpine3.22

FROM node:${NODE_VERSION} AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build

# Pré-compression : nginx (gzip_static) sert les .gz sans travail à la volée
RUN find dist -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \
      -o -name '*.svg' -o -name '*.xml' -o -name '*.txt' -o -name '*.json' \) \
      -exec gzip -9 -k {} \;

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}

COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html
