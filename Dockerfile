FROM node:20-alpine

COPY . /src

WORKDIR /src

## FIX: some packages rely on node-datachannel which
## needs c++ to execute prebuild
## but cmake cannot find openssl even I install
RUN apk add --update --no-cache --virtual .gyp \
    libffi-dev \
    openssl-dev \
    g++ \
    cmake \
    && yarn && rm -rf packages/frontend \
    && apk del .gyp

RUN sh scripts/loadKeys.sh

RUN rm -r packages/relay/keys/buildOrdered*

FROM node:20-alpine

COPY --from=0 /src /src
WORKDIR /src/packages/relay

CMD ["npm", "start"]
