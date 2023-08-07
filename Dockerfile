FROM node:20-alpine3.18

RUN apt-get update && apt-get install -y nginx --no-install-recommends

WORKDIR /journly

COPY package*.json pnpm-lock.yaml ./journly/

RUN npm install -g pnpm@8.6.11 && pnpm install

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/

COPY . /journly

EXPOSE 80

RUN chmod +x /journly/scripts/entrypoint.sh

RUN pnpm run build && pnpm run build:css

CMD ["/journly/scripts/entrypoint.sh"]
