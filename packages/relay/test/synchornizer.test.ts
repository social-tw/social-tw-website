import { ethers } from 'hardhat'
import { expect } from 'chai'
import { Unirep, UnirepApp } from '@unirep-app/contracts/typechain-types'
import { deployContracts, startServer } from './environment'
import { Server } from 'http'
import { UserState } from '@unirep/core'
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { userService } from '../src/services/UserService'
import { signUp } from './utils/signUp'
import { HTTP_SERVER } from './configs'
import { io } from 'socket.io-client'

describe('Synchronize Comment Test', function () {
    let snapshot: any
    let express: Server
    let sync: UnirepSocialSynchronizer
    let unirep: Unirep
    let unirepApp: UnirepApp
    let users: {
        hashUserId: String
        wallet: any
        userState: UserState
    }[] = []
    const EPOCH_LENGTH = 300

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // Deploy contract
        const contracts = await deployContracts(EPOCH_LENGTH)
        unirepApp = contracts.app
        unirep = contracts.unirep

        // Start server
        const { db, prover, provider, synchronizer, server } =
            await startServer(unirep, unirepApp)
        express = server
        sync = synchronizer

        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            unirepApp,
            synchronizer
        )

        // Create users identity and signup users
        for (let i = 0; i < 2; i++) {
            const wallet = ethers.Wallet.createRandom()

            let initUser = await userService.getLoginUser(
                db,
                i.toString(),
                undefined
            )

            let userState = await signUp(
                initUser,
                userStateFactory,
                userService,
                sync,
                wallet
            )

            users.push({
                hashUserId: initUser.hashUserId,
                wallet: wallet,
                userState: userState,
            })
        }

        // Ensure users are signed up
        for (let i = 0; i < 2; i++) {
            await users[i].userState.waitForSync()
            let hasSignUp = await users[i].userState.hasSignedUp()
            expect(hasSignUp).equal(true)
        }
    })

    after(async function () {
        console.log('Close server...')
        express.close()
        await ethers.provider.send('evm_revert', [snapshot])
        // Ensure users are signed up
        for (let i = 0; i < 2; i++) {
            users[i].userState.stop()
        }
    })

    describe('Synchronize Comment', async function () {
        before(async function () {
            // User 0 post a thread
            const postContent = "I'm a post"

            const userState = users[0].userState
            const epoch = await sync.loadCurrentEpoch()
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                epoch,
            })

            await expect(unirepApp.post(publicSignals, proof, postContent))
                .to.emit(unirepApp, 'Post')
                .withArgs(publicSignals[0], 0, 0, postContent)

            await sync.waitForSync()

            // check db if the post is synchronized
            let record = await sync.db.findMany('Post', { where: {} })
            expect(record).to.be.not.null
            expect(record.length).equal(1)
            expect(record[0].postId).equal('0')
        })

        it('should synchronize comment', async function () {
            // User 1 post a comment on the thread
            const commentContent = "I'm a comment"

            const userState = users[1].userState
            const epoch = await sync.loadCurrentEpoch()
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                epoch,
            })

            // set up socket listener
            const clientSocket = io(HTTP_SERVER)
            clientSocket.on('comment', (...args) => {
                const [comment] = args
                expect(comment.postId).equal('0')
                expect(comment.content).equal(commentContent)
                expect(comment.epoch).equal(epoch)
                clientSocket.close()
            })

            await expect(
                unirepApp.leaveComment(publicSignals, proof, 0, commentContent)
            )
                .to.emit(unirepApp, 'Comment')
                .withArgs(publicSignals[0], 0, 0, 0, commentContent)

            await sync.waitForSync()

            // Check if the comment is synchronized
            let record = await sync.db.findMany('Comment', { where: {} })
            expect(record).to.be.not.null
            expect(record.length).equal(1)
            expect(record[0].commentId).equal('0')
            expect(record[0].postId).equal('0')
            expect(record[0].content).equal(commentContent)

            // Check if the comment count is synchronized
            let postRecord = await sync.db.findOne('Post', {
                where: {
                    postId: record[0].postId,
                },
            })
            expect(postRecord).to.be.not.null
            expect(postRecord.commentCount).equal(1)
        })

        it('should update comment', async function () {
            // User 1 edit the comment
            const userState = users[1].userState
            const newContent = "I'm not a comment what you want"
            const { publicSignals, proof } =
                await userState.genEpochKeyLiteProof()

            await expect(
                unirepApp.editComment(publicSignals, proof, 0, 0, newContent, {
                    gasLimit: 5000000,
                })
            )
                .to.emit(unirepApp, 'UpdatedComment')
                .withArgs(publicSignals[1], 0, 0, 0, newContent)

            await sync.waitForSync()

            // Check if the comment is synchronized
            let record = await sync.db.findMany('Comment', { where: {} })
            expect(record).to.be.not.null
            expect(record.length).equal(1)
            expect(record[0].commentId).equal('0')
            expect(record[0].postId).equal('0')
            expect(record[0].content).equal(newContent)
        })
    })
})
