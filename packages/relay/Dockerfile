FROM node:18-buster

RUN apt-get install -y \
    ca-certificates && \
    update-ca-certificates

COPY ./node_modules/ /src/node_modules/
COPY ./tsconfig.json /src/tsconfig.json
COPY ./packages/contracts/abi/ /src/packages/contracts/abi/

COPY ./packages/relay/ /src/packages/relay/

WORKDIR /src/packages/relay

EXPOSE 8000

CMD ["npm", "start"]