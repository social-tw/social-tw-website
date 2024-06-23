import { UserState } from '@unirep/core'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { commentService } from '../src/services/CommentService'

import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { CommentStatus } from '../src/types/Comment'
import { Post } from '../src/types/Post'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { comment } from './utils/comment'
import { post } from './utils/post'
import { signUp } from './utils/signUp'

describe('Report /report', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let chainId: number
    let db: any
    let nonce: number = 0

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const {
            db: _db,
            prover,
            provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, app)
        db = _db
        express = chaiServer
        sync = synchronizer
        express = chaiServer
        sync = synchronizer

        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app,
            synchronizer
        )

        // initUserStatus
        let initUser = await userService.getLoginUser(db, '123', undefined)
        const wallet = ethers.Wallet.createRandom()
        userState = await signUp(
            initUser,
            userStateFactory,
            userService,
            synchronizer,
            wallet
        )

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()

        expect(hasSignedUp).equal(true)

        await post(chaiServer, userState, nonce).then(async (res) => {
            await ethers.provider.waitForTransaction(res.txHash)
            await sync.waitForSync()
            nonce++
        })

        await chaiServer.get('/api/post/0').then((res) => {
            expect(res).to.have.status(200)
            const curPost = res.body as Post
            expect(curPost.status).to.equal(1)
        })

        await comment(chaiServer, userState, '0', nonce).then(async (res) => {
            await ethers.provider.waitForTransaction(res.txHash)
            await sync.waitForSync()
            nonce++
        })

        const resComment = await commentService.fetchSingleComment(
            '0',
            db,
            CommentStatus.OnChain
        )
        expect(resComment).to.be.exist

        chainId = await unirep.chainid()
    })

    after(async function () {
        await stopServer('report', snapshot, sync, express)
    })

    it('should fetch report whose reportEpoch is equal to currentEpoch - 1', async function () {
        let { txHash } = await post(express, userState)
        await ethers.provider.waitForTransaction(txHash);
        txHash = await express
        .post('/api/report/0')
        .set('content-type', 'application/json')
        .send()
        .then((res) => {
            expect(res).to.have.status(200)
            return res.body.txHash
        })
        // epoch transition
        const remainingTime = sync.calcEpochRemainingTime()
        await ethers.provider.send('evm_increaseTime', [remainingTime])
        await ethers.provider.send('evm_mine', [])

        const reports = await express.get('/api/report?status=0').then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })

        expect(reports.length).equal(1)
    })

    it('should fetch report whose adjudication result is tie', async function() {
        let { txHash } = await post(express, userState)
        await ethers.provider.waitForTransaction(txHash)
        txHash = await express
        .post('/api/report/1')
        .set('content-type', 'application/json')
        .send()
        .then((res) => {
            expect(res).to.have.status(200)
            return res.body.txHash
        })

        // epoch transition
        let remainingTime = sync.calcEpochRemainingTime()
        await ethers.provider.send('evm_increaseTime', [remainingTime])
        await ethers.provider.send('evm_mine', [])

        db.update('ReportHistory', {
            where: { reportId: '1' },
            update: {
                adjudicatorsNullifier: {
                    rows: [
                        {adjudicateValue: 1},
                        {adjudicateValue: 1},
                        {adjudicateValue: 1},
                        {adjudicateValue: 0},
                        {adjudicateValue: 0},
                        {adjudicateValue: 0}
                    ]
                }
            }
        })

        // epoch transition
        remainingTime = sync.calcEpochRemainingTime()
        await ethers.provider.send('evm_increaseTime', [remainingTime])
        await ethers.provider.send('evm_mine', [])

        const reports = await express.get('/api/report?status=0').then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })

        const adjudicateResult = reports[1].adjudicatorsNullifier.flatMap((nullifier) => nullifier.adjudicateValue)
        .reduce((acc, value) => {
            if (Number(value) == 0) {
                return acc - 1
            }

            return acc + 1
        })
        expect(adjudicateResult).equal(0)
        expect(reports[1].adjudicateCount).gt(5)
    })

    it('should fetch report whose adjudication count is less than 5', async function() {
        const reports = await express.get('/api/report?status=0').then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })

        expect(reports[0].adjudicateCount).lt(5)
        expect(reports[0].staus).equal(0)
        const epochDiff = sync.calcCurrentEpoch() - reports[0].reportEpoch
        expect(epochDiff).gt(1)
    })
})
