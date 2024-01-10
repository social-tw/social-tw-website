import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

import { Server } from 'http'
import { addActionCount } from '../src/utils/TransactionHelper'

describe('My Account Page', function () {
    let snapshot: any
    let express: Server
    let postEpochKey = 'post-epoch-key'
    let voteEpochKey = 'vote-epoch-key'
    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(1000)
        // start server
        const { db, server } = await startServer(unirep, app)
        express = server
        const epoch = 1

        // insert mock post
        await addActionCount(db, postEpochKey, epoch, (txDB) => {
            txDB.create('Post', {
                content: 'content',
                cid: 'cid',
                epochKey: postEpochKey,
                epoch: epoch,
                transactionHash: 'txnHash',
                _id: '1',
            })
            return 1
        })

        // insert mock vote
        await addActionCount(db, voteEpochKey, epoch, (txDB) => {
            txDB.create('Vote', {
                epochKey: voteEpochKey,
                epoch: epoch,
                postId: '1',
                _id: '1',
                upVote: true,
            })
            return 1
        })
    })

    after(async function () {
        await ethers.provider.send('evm_revert', [snapshot])
        express.close()
    })

    it('should fetch posts', async function () {
        const posts: any = await fetch(
            `${HTTP_SERVER}/api/my-account/posts?epks=${postEpochKey}`
        ).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(posts.length).equal(1)
    })

    it('should fail if epks is empty', async function () {
        await fetch(`${HTTP_SERVER}/api/my-account/posts`).then((r) => {
            expect(r.status).equal(400)
        })
    })

    it('should fail if sortKey is not allowed', async function () {
        await fetch(`${HTTP_SERVER}/api/my-account/posts?sortKey=foo`).then(
            (r) => {
                expect(r.status).equal(400)
            }
        )
    })

    it('should fail if direction is not allowed', async function () {
        await fetch(`${HTTP_SERVER}/api/my-account/posts?direction=foo`).then(
            (r) => {
                expect(r.status).equal(400)
            }
        )
    })

    it('should fetch votes along with posts', async function () {
        const votes: any = await fetch(
            `${HTTP_SERVER}/api/my-account/votes?epks=${voteEpochKey}`
        ).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(votes.length).equal(1)
        expect(votes[0].post).to.not.be.null
    })
})
