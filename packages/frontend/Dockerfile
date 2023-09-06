FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app
COPY ./build /app

CMD ["serve"]
