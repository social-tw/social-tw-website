import { UnirepApp } from '@unirep-app/contracts/typechain-types'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { io } from 'socket.io-client'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import IpfsHelper from '../src/services/utils/IpfsHelper'
import { HTTP_SERVER } from './configs'
import { deployContracts, startServer, stopServer } from './environment'
import { genAuthentication } from './utils/genAuthentication'
import { post } from './utils/post'
import { signUp } from './utils/signup'
import { IdentityObject } from './utils/types'
import { createUserIdentities, genUserState } from './utils/userHelper'

describe('Synchronize Post Test', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let sync: UnirepSocialSynchronizer
    let users: IdentityObject[]
    let authentication: string
    let app: UnirepApp
    let prover: any
    let provider: any
    let db: DB

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // Deploy contract
        const { unirep, app: _app } = await deployContracts(100000)
        // Start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, _app)
        express = chaiServer
        sync = synchronizer
        app = _app
        provider = _provider
        prover = _prover
        db = _db

        // Create users identity and signup users
        users = createUserIdentities(2)
        const userState = await signUp(users[0], {
            app,
            db,
            prover,
            provider,
            sync,
        })

        // signup in another block to prevent timeout
        {
            await signUp(users[1], {
                app,
                db,
                prover,
                provider,
                sync,
            })
        }

        authentication = await genAuthentication(userState)
    })

    after(async function () {
        await stopServer('synchronize', snapshot, sync, express)
    })

    describe('Synchronize Post', async function () {
        it('should synchronize post', async function () {
            const userState = await genUserState(users[0].id, app, prover)
            const txHash = await post(express, userState, authentication)
            const { createHelia } = await eval("import('helia')")
            const helia = await createHelia()
            const contentHash = await IpfsHelper.createIpfsContent(
                helia,
                'test content',
            )

            await provider.waitForTransaction(txHash)
            await sync.waitForSync()

            // check db if the post is synchronized
            let record = await sync.db.findOne('Post', {
                where: {
                    postId: '0',
                    status: 1,
                },
            })

            expect(record.postId).equal('0')
            expect(record.content).equal('test content')
            expect(record.cid).equal(contentHash)
            expect(record.status).equal(1)
        })
    })
})

describe('Synchronize Comment Test', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let sync: UnirepSocialSynchronizer
    let users: IdentityObject[]
    let authentication: string
    let app: UnirepApp
    let prover: any
    let provider: any
    let db: DB

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // Deploy contract
        const { unirep, app: _app } = await deployContracts(100000)
        // Start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, _app)
        express = chaiServer
        sync = synchronizer
        app = _app
        provider = _provider
        prover = _prover
        db = _db

        // Create users identity and signup users
        users = createUserIdentities(2)
        const userState = await signUp(users[0], {
            app,
            db,
            prover,
            provider,
            sync,
        })

        // signup in another block to prevent timeout
        {
            await signUp(users[1], {
                app,
                db,
                prover,
                provider,
                sync,
            })
        }

        authentication = await genAuthentication(userState)
    })

    after(async function () {
        await stopServer('synchronize', snapshot, sync, express)
    })

    describe('Synchronize Comment', async function () {
        before(async function () {
            const userState = await genUserState(users[0].id, app, prover)

            {
                const txHash = await post(express, userState, authentication)
                await provider.waitForTransaction(txHash)
                await sync.waitForSync()
            }
            // check db if the post is synchronized
            let record = await sync.db.findMany('Post', { where: {} })
            expect(record).to.be.not.null
            expect(record.length).equal(1)
            expect(record[0].postId).equal('0')
        })

        it('should synchronize comment', async function () {
            // User 1 post a comment on the thread
            const commentContent = "I'm a comment"

            const userState = await genUserState(users[1].id, app, prover)
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
                app.leaveComment(publicSignals, proof, 0, commentContent),
            )
                .to.emit(app, 'Comment')
                .withArgs(publicSignals[0], 0, 0, 0, commentContent)

            await sync.waitForSync()

            // Check if the comment is synchronized
            const record = await db.findMany('Comment', { where: {} })
            expect(record).to.be.not.null
            expect(record.length).equal(1)
            expect(record[0].commentId).equal('0')
            expect(record[0].postId).equal('0')
            expect(record[0].content).equal(commentContent)

            // Check if the comment count is synchronized
            const postRecord = await db.findOne('Post', {
                where: {
                    postId: record[0].postId,
                },
            })
            expect(postRecord).to.be.not.null
            expect(postRecord.commentCount).equal(1)
        })

        it('should update comment', async function () {
            // User 1 edit the comment
            const userState = await genUserState(users[1].id, app, prover)
            const newContent = "I'm not a comment what you want"
            const { publicSignals, proof } =
                await userState.genEpochKeyLiteProof()

            await expect(
                app.editComment(publicSignals, proof, 0, 0, newContent, {
                    gasLimit: 5000000,
                }),
            )
                .to.emit(app, 'UpdatedComment')
                .withArgs(publicSignals[1], 0, 0, 0, newContent)

            await sync.waitForSync()

            // Check if the comment is synchronized
            const record = await db.findMany('Comment', { where: {} })
            expect(record).to.be.not.null
            expect(record.length).equal(1)
            expect(record[0].commentId).equal('0')
            expect(record[0].postId).equal('0')
            expect(record[0].content).equal(newContent)
        })
    })
})
