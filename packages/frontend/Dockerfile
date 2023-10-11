FROM node:18-buster

RUN apt-get install -y \
    ca-certificates && \
    update-ca-certificates

COPY ./tsconfig.json /src/tsconfig.json
COPY ./packages/frontend/ /src/packages/frontend/

COPY ./packages/circuits/dist/ /src/packages/circuits/dist/
COPY ./packages/circuits/tsconfig.json /src/packages/circuits/tsconfig.json
COPY ./packages/circuits/package.json /src/packages/circuits/package.json

WORKDIR /src/packages/frontend

EXPOSE 3000

CMD ["npm", "start"]

# local run command
# docker build -t test-frontend:0.1 -f packages/frontend/Dockerfile .
# docker run --rm -p 3000:3000 --network="bridge" test-frontend:0.1