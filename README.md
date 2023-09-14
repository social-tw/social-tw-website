<p align="center">
    <img src="https://raw.githubusercontent.com/social-tw/social-tw-website/6cae1ef115864d3301a2d216a07f553058f31327/packages/frontend/src/assets/logo.svg"
        height="130"><h1 align="center">unirep social taiwan</h1>
</p>

<p align="center">
    <a href="https://github.com/social-tw/social-tw-website">
        <img src="https://img.shields.io/badge/project-unirep social taiwan-blue.svg?style=flat-square">
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

## 1. Installation

```shell
git clone git@github.com:social-tw/social-tw-website.git
cd social-tw-website
yarn install
npm install -g circom
```

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

# Contributing
