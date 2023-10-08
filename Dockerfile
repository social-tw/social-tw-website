FROM node:18-buster

COPY . /src

WORKDIR /src

## some packages rely on node-datachannel which
## needs c++ to execute prebuild
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev \
        wget
RUN yarn && rm -rf packages/frontend

RUN sh scripts/loadKeys.sh

FROM node:18-buster

COPY --from=0 /src /src

WORKDIR /src/packages/relay

CMD ["npm", "start"]