FROM node:16.14.2-slim AS build

RUN apt-get update && apt-get install -y git

WORKDIR /app
COPY . /app

RUN npm ci
RUN npm run bootstrap

FROM node:16.14.2-slim

RUN mkdir /app
WORKDIR /app
COPY --from=build /app/packages/insomnia-inso ./insomnia-inso
COPY --from=build /app/packages/openapi-2-kong ./openapi-2-kong
COPY --from=build /app/packages/insomnia-testing ./insomnia-testing

RUN ls /app
RUN ls /app/insomnia-inso

ENTRYPOINT ["/app/insomnia-inso/bin/inso"]