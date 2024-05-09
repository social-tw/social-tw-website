<p align="center">
    <img src="https://raw.githubusercontent.com/social-tw/social-tw-website/6cae1ef115864d3301a2d216a07f553058f31327/packages/frontend/src/assets/logo.svg"
        height="130"><h1 align="center">Unirep Social Taiwan</h1>
</p>

<p align="center">
    <a href="https://github.com/social-tw/social-tw-website">
        <img src="https://img.shields.io/badge/project-social tw website-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/social-tw/social-tw-website/actions">
        <img alt="Github Action" src="https://github.com/social-tw/social-tw-website/actions/workflows/main-ci.yml/badge.svg?branch=main">
    </a>
    <a href="https://github.com/social-tw/social-tw-website/graphs/contributors">
        <img alt="Github contributors" src="https://img.shields.io/github/contributors/social-tw/social-tw-website.svg">
    </a>
    <a href="https://github.com/social-tw/social-tw-website/issues">
        <img alt="Github ISSUE" src="https://img.shields.io/github/issues/social-tw/social-tw-website.svg">
    </a>
    <a href="https://github.com/social-tw/social-tw-website/pulls">
        <img alt="Github PR" src="https://img.shields.io/github/issues-pr/social-tw/social-tw-website.svg">
    </a>
    <a href="https://github.com/social-tw/social-tw-website/commits/main">
        <img alt="Github Action" src="https://img.shields.io/github/commit-activity/m/social-tw/social-tw-website?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@unirep/core">
        <img alt="@unirep/core" src="https://img.shields.io/badge/@unirep/core-2.0.0.beta.4-brightgreen">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/identity">
        <img alt="@unirep/core" src="https://img.shields.io/badge/@semaphore/protocol/identity-3.6.0-brightgreen">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <a href="https://discord.gg/RSwXuVNZ4H">
        <img alt="chat on Discord" src="https://img.shields.io/discord/1113118365490352220?logo=discord">
    </a>
</p>

Welcome to the unirep social taiwan project. Leveraging the power of Unirep, our mission is to create a platform where
community members can engage in discussions with 100% anonymity. We believe in fostering a space where individuals can
express their thoughts and ideas securely, without the fear of their identities being revealed.

Join us in our journey towards a more anonymous and secure online community space!

# Quickstart

## 0. Requirements

-   Intall [rust](https://www.rust-lang.org/tools/install) and [circom 2](https://docs.circom.io/getting-started/installation/)
-   Node.js >= 18

## 1. Installation

```shell
git clone git@github.com:social-tw/social-tw-website.git
cd social-tw-website
yarn install
```

## 2. Start with each daemon

### 2.1 Build the files

```shell
yarn build
```

### 2.2 Start a node

```shell
yarn contracts hardhat node
```

### 2.3 Set up Twitter API Key

```shell
cp packages/relay/.env.example packages/relay/.env
```

Then fill in your Twitter API Key in `packages/relay/.env`

### 2.4 Deploy smart contracts

in new terminal window, from root:

```shell
yarn contracts deploy
```

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

## 3. Test with each daemon

### [circuits](packages%2Fcircuits)

```shell
yarn circuits test
```

[contracts](packages%2Fcontracts)

```shell
yarn contracts test
```

[frontend](packages%2Ffrontend)

```shell
yarn frontend test
```

[relay](packages%2Frelay)

```shell
yarn relay test
```

## 4. Lint

Ensure that your code follows the established style guidelines and is correctly formatted using Prettier:

### 4.1 Check Code Formatting

View the suggested code formatting without making changes:

```shell
yarn lint
```

### 4.2 Apply Code Formatting

Automatically format your code to match Prettier's style:

```shell
yarn lint:fix
```

4.3 Verify Code Formatting
Ensure that your code is formatted correctly:

```shell
yarn lint:check
```

## 5. Deploy

### 5.1 Deploy frontend locally

```shell
docker build -t test-frontend:0.1 -f packages/frontend/Dockerfile .

docker run --rm -p 3000:3000 --network="bridge" test-frontend:0.1
```

### 5.2 Deploy backend locally

```shell
docker build -t test-relay:0.1 -f packages/relay/Dockerfile .

docker run --network="host" --rm -p 8000:8000 test-relay:0.1
```

# Contributing

### Getting Started

Before diving into the codebase:

1. **Read the CONTRIBUTING.md**: Please ensure you've reviewed our [CONTRIBUTING.md](CONTRIBUTING.md). It contains crucial information on our coding standards, the pull request process, and more.
2. **Search Existing Issues**: We use the GitHub issue tracker to manage our tasks and bugs. Please spend a few minutes searching for issues to see if someone else has already reported the same problem or suggested the same change.
3. **Reporting New Issues**: If you don't find an existing issue that addresses your concern, feel free to open a new one. Provide as much detail as possible to help us understand the context and importance.

### Steps for Contributing

1. **Fork the Repository**: If you're not a direct contributor, start by forking the main repository.
2. **Create a New Branch**: Branches should be named descriptively. For example: add-login-feature or fix-image-upload-bug.
3. **Implement Your Changes**: Make sure your changes adhere to our coding standards and don't introduce new issues.
4. **Submit a Pull Request (PR)**: Once you're satisfied with your changes, push your branch to your fork and submit a pull request. Our team will review it, suggest changes if necessary, and merge it when it's ready.

### Branch naming conventions

Please follow the following branch naming scheme when creating your branch:

-   `feature-foo-bar` for new features
-   `fix-foo-bar` for bug fixes
-   `test-foo-bar` when the change concerns only the test suite
-   `refactor-foo-bar` when refactoring code without any behavior change

## Community

Join the conversation and help the community.

-   [Discord](https://discord.gg/RSwXuVNZ4H)
