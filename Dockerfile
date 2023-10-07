FROM node:20-alpine

COPY . /src

WORKDIR /src

RUN yarn && rm -rf packages/frontend

RUN sh scripts/loadKeys.sh

RUN rm -r packages/relay/keys/buildOrdered*

FROM node:20-alpine

COPY --from=0 /src /src
WORKDIR /src/packages/relay

CMD ["npm", "start"]
