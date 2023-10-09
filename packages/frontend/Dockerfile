FROM node:18-buster as build

## some packages rely on node-datachannel which
## needs c++ to execute prebuild
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev \
        wget

COPY . /src

WORKDIR /src

## install pacakages on root folder(social-tw-website)
RUN yarn

## frontend no need these folders
RUN rm -rf pacakages/contracts pacakages/relay

FROM node:18-buster as runner

## copy the build folder into app
## copy the files to node_modules/ exclude folder itself
COPY --from=build /src/node_modules /src/node_modules/

COPY --from=build /src/packages /src/packages/

WORKDIR /src/packages/frontend

CMD ["npm", "start"]
