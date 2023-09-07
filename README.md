# create-unirep-app

This is a demo app of a [unirep](https://github.com/Unirep/Unirep) attester. In this demo app, users can request data from the example attester. After transition, user can prove how much data he has.

> See: [Users and Attesters](https://developer.unirep.io/docs/protocol/users-and-attesters)

## 1. Installation

```shell
npx create-unirep-app
yarn install
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
cd ..
```

Then `cd` into the directory that was created (other than circom).

## 2 Start with each daemon

### 2.1 Build the files

```shell
yarn build
```

### 2.2 Start a node

```shell
yarn contracts hardhat node
```

### 2.3 Deploy smart contracts

in new terminal window, from root:

```shell
yarn contracts deploy
```

### 2.4 Set up Twitter API Key

```shell
cp packages/relay/.env_example packages/relay/.env
```

Then fill in your Twitter API Key in `packages/relay/.env`

### 2.5 Start a relayer (backend)

```shell
yarn relay start
```

### 2.6 Start a frontend

in new terminal window, from root:

```shell
yarn frontend start
```

It will be running at: http://localhost:3000/
