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

## install pacakages and remove frontend folder
RUN yarn && rm -rf packages/frontend

## install tenderly cli
RUN curl https://raw.githubusercontent.com/Tenderly/tenderly-cli/master/scripts/install-linux.sh | sudo sh

## deploy contract to tenderly devnet which
## will update the config.ts
RUN yarn contracts deploy:devnet

## load keys of circuits
RUN sh scripts/loadKeys.sh

FROM node:18-buster

COPY --from=0 /src /src

WORKDIR /src/packages/relay

CMD ["npm", "start"]