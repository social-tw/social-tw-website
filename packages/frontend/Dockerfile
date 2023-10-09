FROM node:18-buster as build

SHELL ["/bin/bash", "--login", "-c"]

## some packages rely on node-datachannel which
## needs c++ to execute prebuild
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev \
        curl \
        git \
        wget

COPY . /src

WORKDIR /src

## install pacakages on root folder(social-tw-website)
RUN yarn

## install circom for build use
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y && \
    . "$HOME/.cargo/env" && \
    cd /tmp && \
    git clone https://github.com/iden3/circom.git && \
    cd circom && \
    cargo build --release && \
    cargo install --path circom

## execute build so that frontend is able to
## find the circuits/dist/src/index.js
RUN yarn build

## frontend no need these folders
RUN rm -rf pacakages/contracts pacakages/relay

FROM node:18-buster as runner

## copy the files to node_modules/ exclude folder itself
COPY --from=build /src/node_modules /src/node_modules/

COPY --from=build /src/packages /src/packages/

WORKDIR /src/packages/frontend

CMD ["npm", "start"]
