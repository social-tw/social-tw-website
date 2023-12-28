import { expect } from 'chai'
//@ts-ignore
import { ethers } from 'hardhat'
import { describe } from 'node:test'
import { CircuitConfig } from '@unirep/circuits'
import { genStateTreeLeaf, IncrementalMerkleTree } from '@unirep/utils'
import { deployApp } from '../scripts/utils'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createMultipleUserIdentity,
    genEpochKeyLiteProof,
    genEpochKeyProof,
    genUserState,
    randomData,
} from './utils'

const { STATE_TREE_DEPTH } = CircuitConfig.default

describe('Comment Test', function () {
    let unirep: Unirep
    let app: UnirepApp
    let users: IdentityObject[]
    let chainId: number

    // for reused proof
    let inputPublicSig: any
    let inputProof: any

    // epoch length
    const epochLength = 300

    before(async function () {
        // generate 2 random hash user ids
        users = createMultipleUserIdentity(2)

        // deployment
        const [deployer] = await ethers.getSigners()
        const contracts = await deployApp(deployer, epochLength)
        unirep = contracts.unirep
        app = contracts.app

        // user 1 Signup
        const userState1 = await genUserState(users[0].id, app)
        const { publicSignals: publicSig1, proof: proof1 } =
            await userState1.genUserSignUpProof()
        await app.userSignUp(publicSig1, proof1, users[0].hashUserId, false)
        await app.userRegistry(users[0].hashUserId)
        userState1.stop()

        // user 2 Signup
        const userState2 = await genUserState(users[1].id, app)
        const { publicSignals: publicSig2, proof: proof2 } =
            await userState2.genUserSignUpProof()
        await app.userSignUp(publicSig2, proof2, users[1].hashUserId, false)
        await app.userRegistry(users[1].hashUserId)
        userState2.stop()

        // user 1 post something
        const content = 'something interesting'
        const userState = await genUserState(users[0].id, app)
        const { publicSignals: epochKeySig1, proof: epochKeyProof1 } =
            await userState.genEpochKeyProof()
        await app.post(epochKeySig1, epochKeyProof1, content)

        chainId = await unirep.chainid()
    })

    describe('leave comment', async function () {
        it('should revert leaving comment with invalid epoch', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            // generating a proof with wrong epoch
            const wrongEpoch = 44444
            const attesterId = userState.sync.attesterId
            const epoch = await userState.sync.loadCurrentEpoch()
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = randomData()
            const { publicSignals, proof } = await genEpochKeyProof({
                id,
                tree,
                leafIndex,
                epoch: wrongEpoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            const postId = 0
            await expect(
                app.leaveComment(publicSignals, proof, postId, 'Invalid Epoch')
            ).to.be.revertedWithCustomError(app, 'InvalidEpoch')
            userState.stop()
        })

        it('should revert leaving comment with invalid state tree', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            // generate a proof with invalid state tree
            const attesterId = userState.sync.attesterId
            const epoch = await userState.sync.loadCurrentEpoch()
            const tree = new IncrementalMerkleTree(STATE_TREE_DEPTH)
            const data = randomData()
            const leaf = genStateTreeLeaf(
                id.secret,
                attesterId,
                epoch,
                data,
                chainId
            )
            tree.insert(leaf)
            const { publicSignals, proof } = await genEpochKeyProof({
                id,
                tree,
                leafIndex: 0,
                epoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            const postId = 0
            expect(
                app.leaveComment(
                    publicSignals,
                    proof,
                    postId,
                    'Invalid State Tree'
                )
            ).to.be.revertedWithCustomError(app, 'InvalidStateTreeRoot')
            userState.stop()
        })

        it('should revert leaving comment with invalid epoch key proof', async function () {
            const userState = await genUserState(users[1].id, app)
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                nonce: 0,
            })
            const content = 'This is so interesting!'

            proof[0] = BigInt(0)

            await expect(
                app.leaveComment(publicSignals, proof, BigInt(0), content)
            ).to.be.reverted
            userState.stop()
        })

        it('should comment with valid epoch key proof and signals', async function () {
            const userState = await genUserState(users[1].id, app)
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                nonce: 0,
            })
            const content = 'This is so interesting!'
            const postId = 0
            const commentId = 0
            const epoch = await userState.sync.loadCurrentEpoch()

            // record the used proof here
            inputPublicSig = publicSignals
            inputProof = proof

            await expect(
                app.leaveComment(publicSignals, proof, postId, content)
            )
                .to.emit(app, 'Comment')
                .withArgs(
                    publicSignals[0], // epochKey
                    postId,
                    commentId,
                    epoch,
                    content
                )
            userState.stop()
        })

        it('should revert leaving comment with reused proof', async function () {
            const postId = 0
            const content = 'Reused Proof'
            expect(
                app.leaveComment(inputPublicSig, inputProof, postId, content)
            ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
        })
    })

    describe('edit comment', async function () {
        it('should revert editing comment with invalid epoch', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            // generating a proof with wrong epoch
            const wrongEpoch = 44444
            const attesterId = userState.sync.attesterId
            const postId = 0
            const commentId = 0
            const content = 'Invalid Epoch'
            const { publicSignals, proof } = await genEpochKeyLiteProof({
                id,
                epoch: wrongEpoch,
                nonce: 0,
                attesterId,
                chainId,
            })
            await expect(
                app.editComment(
                    publicSignals,
                    proof,
                    postId,
                    commentId,
                    content
                )
            ).to.be.revertedWithCustomError(app, 'InvalidEpoch')
            userState.stop()
        })

        it('should revert with invalid comment id', async function () {
            const userState = await genUserState(users[1].id, app)
            const { publicSignals, proof } =
                await userState.genEpochKeyLiteProof({
                    epoch: 0,
                    nonce: 0,
                })
            const postId = 0
            const commentId = 1
            const newContent = 'Invalid Comment Id'
            await expect(
                app.editComment(
                    publicSignals,
                    proof,
                    postId,
                    commentId,
                    newContent
                )
            ).to.be.revertedWithCustomError(app, 'InvalidCommentId')
            userState.stop()
        })

        it('should revert with invalid epochKey', async function () {
            const userState = await genUserState(users[1].id, app)
            const { publicSignals, proof } =
                await userState.genEpochKeyLiteProof({
                    epoch: 0,
                    nonce: 0,
                })
            publicSignals[1] = BigInt(0)
            const postId = 0
            const commentId = 0
            const newContent = 'Invalid Comment Epoch Key'
            await expect(
                app.editComment(
                    publicSignals,
                    proof,
                    postId,
                    commentId,
                    newContent
                )
            ).to.be.revertedWithCustomError(app, 'InvalidCommentEpochKey')
            userState.stop()
        })

        it('should revert editing comment with invalid epoch key lite proof', async function () {
            const userState = await genUserState(users[1].id, app)
            const { publicSignals, proof } =
                await userState.genEpochKeyLiteProof({
                    epoch: 0,
                    nonce: 0,
                })
            proof[0] = BigInt(0)
            const postId = 0
            const commentId = 0
            const newContent = 'Invalid Proof'
            await expect(
                app.editComment(
                    publicSignals,
                    proof,
                    postId,
                    commentId,
                    newContent
                )
            ).to.be.reverted
            userState.stop()
        })

        it('should update comment with same epoch and nonce', async function () {
            const userState = await genUserState(users[1].id, app)
            const { publicSignals, proof } =
                await userState.genEpochKeyLiteProof()
            const postId = 0
            const commentId = 0
            const newContent = 'Nice content, bruh!'

            inputPublicSig = publicSignals
            inputProof = proof

            await expect(
                app.editComment(
                    publicSignals,
                    proof,
                    postId,
                    commentId,
                    newContent
                )
            )
                .to.emit(app, 'UpdatedComment')
                .withArgs(
                    publicSignals[1], // epochKey
                    postId,
                    commentId,
                    0, // epoch
                    newContent
                )
            userState.stop()
        })

        it('should revert editing comment with reused proof', async function () {
            const postId = 0
            const commentId = 0
            const newContent = 'Reused Proof'
            await expect(
                app.editComment(
                    inputPublicSig,
                    inputProof,
                    postId,
                    commentId,
                    newContent
                )
            ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
        })

        {
            // epoch transition
            await ethers.provider.send('evm_increaseTime', [epochLength])
            await ethers.provider.send('evm_mine', [])
        }

        {
            // user state transition
            const userState2 = await genUserState(users[1].id, app)
            const attesterId = userState2.sync.attesterId
            const toEpoch = await unirep.attesterCurrentEpoch(attesterId)

            await userState2.waitForSync()
            const { publicSignals, proof } =
                await userState2.genUserStateTransitionProof({ toEpoch })
            await unirep
                .userStateTransition(publicSignals, proof)
                .then((tx) => tx.wait())

            userState2.stop()
        }

        it('should update comment in another epoch', async function () {
            const userState = await genUserState(users[1].id, app)
            userState.waitForSync()
            const { publicSignals, proof } =
                await userState.genEpochKeyLiteProof()
            const postId = 0
            const commentId = 0
            const newContent = 'Nice content, bruh!'

            await expect(
                app.editComment(
                    publicSignals,
                    proof,
                    postId,
                    commentId,
                    newContent
                )
            )
                .to.emit(app, 'UpdatedComment')
                .withArgs(
                    publicSignals[1], // epochKey
                    postId,
                    commentId,
                    0, // epoch
                    newContent
                )
            userState.stop()
        })
    })
})
