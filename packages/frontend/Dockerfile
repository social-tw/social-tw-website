FROM node:20-alpine as build

## install pacakages on root folder(social-tw-website)
RUN yarn

## change working directory to frontend
WORKDIR /packages/frontend

## build frontend project
RUN yarn build

FROM node:20-alpine as runner

RUN yarn add serve

WORKDIR /app

## copy the build folder into app
COPY --from=build /packages/frontend/build .

CMD ["serve"]
