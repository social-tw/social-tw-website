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

# local run command
# docker build -t test-relay:0.1 -f packages/relay/Dockerfile .
# docker run --network="host" --rm -p 8000:8000 test-relay:0.1