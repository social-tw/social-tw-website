FROM node:18-buster as build

COPY . /src

WORKDIR /src

## some packages rely on node-datachannel which
## needs c++ to execute prebuild
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev \
        wget

## install pacakages on root folder(social-tw-website)
RUN yarn

## change working directory to frontend
WORKDIR /src/packages/frontend

## build frontend project only
RUN yarn build

FROM node:18-buster as runner

RUN npm i -g serve

WORKDIR /app

## copy the build folder into app
COPY --from=build /src/packages/frontend/build .

CMD ["serve"]
