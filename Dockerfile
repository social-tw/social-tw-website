FROM node:18-buster

## some packages rely on node-datachannel which
## needs c++ to execute prebuild
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev \
        wget

COPY . /src

WORKDIR /src

## install pacakages and remove frontend folder
RUN yarn && rm -rf packages/frontend

## load keys of circuits
RUN sh scripts/loadKeys.sh

FROM node:18-buster

COPY --from=0 /src /src

WORKDIR /src/packages/relay

CMD ["npm", "start"]