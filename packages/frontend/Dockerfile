FROM node:18-buster

RUN apt-get install -y \
    ca-certificates && \
    update-ca-certificates

COPY ./node_modules/ /src/node_modules/

COPY ./tsconfig.json /src/tsconfig.json
COPY ./packages/frontend/ /src/packages/frontend/

COPY ./packages/circuits/dist/ /src/packages/circuits/dist/
COPY ./packages/circuits/tsconfig.json /src/packages/circuits/tsconfig.json
COPY ./packages/circuits/package.json /src/packages/circuits/package.json

WORKDIR /src/packages/frontend

ENV ENV=${ENV}
ENV STAGE_SERVER=${STAGE_SERVER}
ENV NODE_OPTIONS=${NODE_OPTIONS}

EXPOSE 3000

CMD ["npm", "start"]