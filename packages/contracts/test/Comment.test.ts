//@ts-ignore
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { describe } from 'node:test'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import {
    createMultipleUserIdentity,
    genReputationProof,
    genUserState,
    userStateTransition,
} from './utils'

describe('Comment Test', function () {
    let unirep: Unirep
    let app: UnirepApp
    let chainId: number

    // for reused proof
    let inputPublicSig: any
    let inputProof: any

    // snapshot of evm environment
    let snapshot: any
    // epoch length
    const epochLength = 300

    // generate 2 random hash user ids
    const users = createMultipleUserIdentity(2)

    // record and revert of evm enviroment
    {
        before(async function () {
            snapshot = await ethers.provider.send('evm_snapshot', [])
        })
        after(async function () {
            await ethers.provider.send('evm_revert', [snapshot])
        })
    }

    before(async function () {
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
        const repProof = await userState.genProveReputationProof({})
        await app.post(repProof.publicSignals, repProof.proof, content)

        chainId = await unirep.chainid()
    })

    describe('leave comment', async function () {
        it('should revert leaving comment with invalid epoch', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            const epoch = await userState.sync.loadCurrentEpoch()
            // generating a proof with wrong epoch
            const wrongEpoch = 44444
            const attesterId = userState.sync.attesterId
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = await userState.getProvableData()
            const repProof = await genReputationProof({
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
                app.leaveComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    'Invalid Epoch'
                )
            ).to.be.revertedWithCustomError(app, 'InvalidEpoch')
            userState.stop()
        })

        it('should revert leaving comment with invalid reputation proof', async function () {
            const userState = await genUserState(users[1].id, app)
            const repProof = await userState.genProveReputationProof({})
            const content = 'This is so interesting!'

            repProof.proof[0] = BigInt(0)

            await expect(
                app.leaveComment(
                    repProof.publicSignals,
                    repProof.proof,
                    BigInt(0),
                    content
                )
            ).to.be.reverted
            userState.stop()
        })

        it('should comment with valid reputation proof and signals', async function () {
            const userState = await genUserState(users[1].id, app)
            const repProof = await userState.genProveReputationProof({})
            const content = 'This is so interesting!'
            const postId = 0
            const commentId = 0
            const epoch = await userState.sync.loadCurrentEpoch()

            // record the used proof here
            inputPublicSig = repProof.publicSignals
            inputProof = repProof.proof

            await expect(
                app.leaveComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    content
                )
            )
                .to.emit(app, 'Comment')
                .withArgs(
                    repProof.publicSignals[0], // epochKey
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

    describe('edit comment', function () {
        it('should revert editing comment with invalid epoch', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            const epoch = 0
            // generating a proof with wrong epoch
            const wrongEpoch = 44444
            const attesterId = userState.sync.attesterId
            const postId = 0
            const commentId = 0
            const content = 'Invalid Epoch'
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = await userState.getProvableData()
            const repProof = await genReputationProof({
                id,
                tree,
                leafIndex,
                epoch: wrongEpoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })

            await expect(
                app.editComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    commentId,
                    content
                )
            ).to.be.revertedWithCustomError(app, 'InvalidEpoch')
            userState.stop()
        })

        it('should revert with invalid comment id', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            const epoch = 0
            const attesterId = userState.sync.attesterId
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = await userState.getProvableData()
            const repProof = await genReputationProof({
                id,
                tree,
                leafIndex,
                epoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            const postId = 0
            const commentId = 1
            const newContent = 'Invalid Comment Id'
            await expect(
                app.editComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    commentId,
                    newContent
                )
            ).to.be.revertedWithCustomError(app, 'InvalidCommentId')
            userState.stop()
        })

        it('should revert with invalid epochKey', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            const epoch = 0
            const attesterId = userState.sync.attesterId
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = await userState.getProvableData()
            const repProof = await genReputationProof({
                id,
                tree,
                leafIndex,
                epoch,
                nonce: 2,
                chainId,
                attesterId,
                data,
            })
            const postId = 0
            const commentId = 0
            const newContent = 'Invalid Comment Epoch Key'
            await expect(
                app.editComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    commentId,
                    newContent
                )
            ).to.be.revertedWithCustomError(app, 'InvalidCommentEpochKey')
            userState.stop()
        })

        it('should revert editing comment with invalid reputation proof', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            const epoch = 0
            const attesterId = userState.sync.attesterId
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = await userState.getProvableData()
            const repProof = await genReputationProof({
                id,
                tree,
                leafIndex,
                epoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            repProof.proof[0] = BigInt(0)
            const postId = 0
            const commentId = 0
            const newContent = 'Invalid Proof'
            await expect(
                app.editComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    commentId,
                    newContent
                )
            ).to.be.reverted
            userState.stop()
        })

        it('should update comment with same epoch and nonce', async function () {
            const userState = await genUserState(users[1].id, app)
            const id = users[1].id
            const epoch = 0
            const attesterId = userState.sync.attesterId
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = await userState.getProvableData()
            const repProof = await genReputationProof({
                id,
                tree,
                leafIndex,
                epoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            const postId = 0
            const commentId = 0
            const newContent = 'Nice content, bruh!'

            inputPublicSig = repProof.publicSignals
            inputProof = repProof.proof

            await expect(
                app.editComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    commentId,
                    newContent
                )
            )
                .to.emit(app, 'UpdatedComment')
                .withArgs(
                    repProof.publicSignals[0], // epochKey
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

        it('should update comment in another epoch', async function () {
            const userState = await genUserState(users[1].id, app)
            const epoch = await userState.sync.loadCurrentEpoch()
            console.log(epoch)

            // user state transition
            await userStateTransition(userState, unirep, app)

            const attesterId = userState.sync.attesterId
            const latestEpoch = await unirep.attesterCurrentEpoch(app.address)
            console.log(latestEpoch)
            const userEpoch = await userState.latestTransitionedEpoch()
            console.log(userEpoch)
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )

            const id = users[1].id
            const data = await userState.getProvableData()
            const repProof = await genReputationProof({
                id,
                tree,
                leafIndex,
                epoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            const postId = 0
            const commentId = 0
            const newContent = 'Nice content, bruh!'

            await expect(
                app.editComment(
                    repProof.publicSignals,
                    repProof.proof,
                    postId,
                    commentId,
                    newContent
                )
            )
                .to.emit(app, 'UpdatedComment')
                .withArgs(
                    repProof.publicSignals[0], // epochKey
                    postId,
                    commentId,
                    0, // epoch
                    newContent
                )
            userState.stop()
        })
    })
})
