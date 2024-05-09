# Sample Unirep Project

This project demonstrates a basic Unirep application. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

## Compile

```shell
yarn build
```

## Test

### Running All Tests

```shell
yarn test
```

### Running Single Test File

#### SignupAndPost

```shell
yarn contracts test ./test/SignupAndPost.test.ts
```

#### Comment

```shell
yarn contracts test ./test/Comment.test.ts
```

## Deploy to local hardhat network

```shell
yarn hardhat node
```

and

```shell
yarn deploy
```

## Contract Explanation

### variables

1. **latestPostId**: A global variable to record the latest post ID.

### mappings

1. **postCommentIndex**:
    - postId `uint256` => commentId `uint256`
    - To maintain & record the comment id for each post
2. **epochKeyCommentMap** a 2-layer mapping:
    - epochKey `uint256` => ( postId `uint256` => commentId `uint256`)
    - To store the epoch key for each post-comment pair
3. **proofNullifier**
    - proof `bytes32` => `bool`
    - To check if the same proof is used before.
4. **userRegistry**
    - userId `uint256` => `bool`
    - To check if same user id is used before.
