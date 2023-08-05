FROM node:20-alpine3.18 as node-build

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./app/

RUN npm install -g pnpm@8.6.11

COPY . /app

RUN pnpm install

EXPOSE 8000

CMD [ "pnpm", "run", "start:dev-concurrent" ]

FROM nginx:alpine3.17-slim

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
