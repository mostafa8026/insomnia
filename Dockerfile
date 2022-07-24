FROM node:16.14.2-slim AS build

RUN apt-get update && apt-get install -y git

WORKDIR /app
RUN git clone --branch feature/bypass-security-plugin-generation https://github.com/mostafa8026/insomnia.git

WORKDIR /app/insomnia
RUN npm install
RUN npm run bootstrap

ENTRYPOINT ["./packages/insomnia-inso/bin/inso"]
