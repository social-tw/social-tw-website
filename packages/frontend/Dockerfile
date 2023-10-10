FROM node:18-buster as deps

## some packages rely on node-datachannel which
## needs c++ to execute prebuild
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev

COPY . /src

WORKDIR /src

## install pacakages on root folder(social-tw-website)
RUN yarn

FROM node:18-buster as build

## sets the Dockerfile's default shell to a bash login shell.
## Note: this means that every subsequent RUN, CMD, and ENTRYPOINT 
## will be run under the current user (usually root), 
## and source the ~/.bashrc file if run in the shell form.
SHELL ["/bin/bash", "--login", "-c"]

RUN apt-get update \
    && apt-get install -y \
        build-essential \
        curl \
        git \
        wget

## install circom for build use
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y && \
    . "$HOME/.cargo/env" && \
    cd /tmp && \
    git clone https://github.com/iden3/circom.git && \
    cd circom && \
    cargo build --release && \
    cargo install --path circom

COPY --from=deps /src /src/

WORKDIR /src

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
