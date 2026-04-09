FROM node:lts-alpine AS build
WORKDIR /app
COPY . .
RUN npm i && npm run build

FROM httpd:latest AS runtime
COPY --from=build /app/dist /usr/local/apache2/htdocs/
RUN echo "ServerName localhost" >> /usr/local/apache2/conf/httpd.conf
EXPOSE 80
