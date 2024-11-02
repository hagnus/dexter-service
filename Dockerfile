FROM alpine:3.19

ENV NODE_VERSION 22.11.0

WORKDIR /dexter-service
COPY package*.json .
RUN apk add --update nodejs npm
RUN npm install
COPY . .
RUN npm run build
CMD npm run start
