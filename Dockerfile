FROM node:16.14.2-slim AS build

RUN apt-get update && apt-get install -y git

WORKDIR /app
COPY . /app

RUN npm run bootstrap

ENTRYPOINT ["./packages/insomnia-inso/bin/inso"]
