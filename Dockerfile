FROM node:18-buster
## TENDERLY ENVS
ARG TENDERLY_ACCESS_KEY
ARG TENDERLY_PROJECT_SLUG
ARG TENDERLY_DEVNET_TEMPLATE
ARG TENDERLY_ACCOUNT_ID

## some packages rely on node-datachannel which
## needs c++ to execute prebuild
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev \
        wget

## install tenderly cli
RUN curl https://raw.githubusercontent.com/Tenderly/tenderly-cli/master/scripts/install-linux.sh | sh

COPY . /src

WORKDIR /src

## install pacakages and remove frontend folder
RUN yarn && rm -rf packages/frontend

## load keys of circuits
RUN sh scripts/loadKeys.sh

## deploy contract to tenderly devnet which
## will update the config.ts
WORKDIR /src/packages/contracts
ENV TENDERLY_PROJECT_SLUG=${TENDERLY_PROJECT_SLUG}
ENV TENDERLY_DEVNET_TEMPLATE=${TENDERLY_DEVNET_TEMPLATE}
ENV TENDERLY_ACCOUNT_ID=${TENDERLY_ACCOUNT_ID}
ENV TENDERLY_ACCESS_KEY=${TENDERLY_ACCESS_KEY}
RUN yarn build && yarn deploy:devnet

FROM node:18-buster

COPY --from=0 /src /src

WORKDIR /src/packages/relay

CMD ["npm", "start"]