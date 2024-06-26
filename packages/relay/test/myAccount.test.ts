import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployContracts, startServer, stopServer } from './environment'

import ActionCountManager from '../src/services/utils/ActionCountManager'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'

describe('My Account Page', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let postEpochKey = 'post-epoch-key'
    let voteEpochKey = 'vote-epoch-key'
    let sync: UnirepSocialSynchronizer
    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const { db, chaiServer, synchronizer } = await startServer(unirep, app)
        express = chaiServer
        sync = synchronizer
        const epoch = 1

        // insert mock post
        await db.create('Post', {
            content: 'content',
            cid: 'cid',
            epochKey: postEpochKey,
            epoch: epoch,
            transactionHash: 'txnHash',
            _id: '1',
            postId: '0',
            status: 1,
        })
        await ActionCountManager.addActionCount(db, postEpochKey, epoch, 1)

        // insert mock vote
        await db.create('Vote', {
            epochKey: voteEpochKey,
            epoch: epoch,
            postId: '1',
            _id: '1',
            upVote: true,
        })
        await ActionCountManager.addActionCount(db, voteEpochKey, epoch, 1)
    })

    after(async function () {
        await stopServer('myAccount', snapshot, sync, express)
    })

    it('should fetch posts', async function () {
        const res = await express.get(
            `/api/my-account/posts?epks=${postEpochKey}`,
        )

        expect(res.body.length).equal(1)
    })

    it('should fail if epks is empty', async function () {
        await express.get(`/api/my-account/posts`).then((r) => {
            expect(r).to.have.status(400)
        })
    })

    it('should fail if sortKey is not allowed', async function () {
        await express.get(`/api/my-account/posts?sortKey=foo`).then((r) => {
            expect(r).to.have.status(400)
        })
    })

    it('should fail if direction is not allowed', async function () {
        await express.get(`/api/my-account/posts?direction=foo`).then((r) => {
            expect(r).to.have.status(400)
        })
    })

    it('should fetch votes along with posts', async function () {
        const votes = await express
            .get(`/api/my-account/posts?epks=${postEpochKey}`)
            .then((r) => {
                expect(r).to.have.status(200)
                return r.body
            })

        expect(votes.length).equal(1)
        expect(votes[0].post).to.not.be.null
    })
})
