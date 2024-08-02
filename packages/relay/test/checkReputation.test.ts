import { UnirepApp } from '@unirep-app/contracts/typechain-types'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { jsonToBase64 } from '../src/middlewares/CheckReputationMiddleware'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { Post } from '../src/types'
import { deployContracts, startServer, stopServer } from './environment'
import { genProveReputationProof, ReputationType } from './utils/genProof'
import { post } from './utils/post'
import { signUp } from './utils/signup'
import { IdentityObject } from './utils/types'
import { createRandomUserIdentity, genUserState } from './utils/userHelper'

describe('CheckReputation', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let chainId: number
    let user: IdentityObject
    let prover: any
    let app: UnirepApp
    let db: DB
    let sync: UnirepSocialSynchronizer

    const EPOCH_LENGTH = 100000

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app: _app } = await deployContracts(EPOCH_LENGTH)
        // start server
        const {
            db: _db,
            prover: _prover,
            provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, _app)
        express = chaiServer
        prover = _prover
        app = _app
        db = _db
        sync = synchronizer

        user = createRandomUserIdentity()
        const userState = await signUp(user, {
            app,
            db,
            prover,
            provider,
            sync,
        })

        chainId = await unirep.chainid()

        userState.stop()
    })

    after(async function () {
        await stopServer('checkReputation', snapshot, sync, express)
    })

    it('should pass the check reputation middleware with positive reputation', async function () {
        const userState = await genUserState(user.id, sync, app, db, prover)
        const epoch = await sync.loadCurrentEpoch()

        const reputationProof = await genProveReputationProof(
            ReputationType.POSITIVE,
            {
                id: userState.id,
                epoch,
                nonce: 1,
                attesterId: sync.attesterId,
                chainId,
                revealNonce: 0,
            }
        )

        const authentication = jsonToBase64(reputationProof)
        const txHash = await post(express, userState, authentication)
        await ethers.provider.waitForTransaction(txHash)
        await sync.waitForSync()

        await express.get('/api/post/0').then((res) => {
            expect(res).to.have.status(200)
            const curPost = res.body as Post
            expect(curPost.status).to.equal(1)
        })

        userState.stop()
    })

    it('should fail the check reputation middleware with negative reputation', async function () {
        const userState = await genUserState(user.id, sync, app, db, prover)
        const epoch = await sync.loadCurrentEpoch()

        const reputationProof = await genProveReputationProof(
            ReputationType.NEGATIVE,
            {
                id: userState.id,
                epoch,
                nonce: 1,
                attesterId: sync.attesterId,
                chainId,
                revealNonce: 0,
            }
        )

        const authentication = jsonToBase64(reputationProof)
        const testContent = 'test content'

        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        const res = await express
            .post('/api/post')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    content: testContent,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )

        expect(res).to.have.status(400)
        expect(res.body.error).to.be.equal('Negative reputation user')

        userState.stop()
    })

    it('should fail the check reputation middleware with wrong reputation proof', async function () {
        const userState = await genUserState(user.id, sync, app, db, prover)
        const epoch = await sync.loadCurrentEpoch()

        const reputationProof = await genProveReputationProof(
            ReputationType.POSITIVE,
            {
                id: userState.id,
                epoch,
                nonce: 1,
                attesterId: sync.attesterId,
                chainId,
                revealNonce: 0,
            }
        )

        reputationProof.proof.pi_a[0] = '0'

        const authentication = jsonToBase64(reputationProof)
        const testContent = 'test content'

        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        const res = await express
            .post('/api/post')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    content: testContent,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )

        expect(res).to.have.status(400)
        expect(res.body.error).to.be.equal('Invalid reputation proof')
    })

    it('should fail the check reputation middleware without authentication', async function () {
        const userState = await genUserState(user.id, sync, app, db, prover)
        const testContent = 'test content'

        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        const res = await express
            .post('/api/post')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    content: testContent,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )

        expect(res).to.have.status(400)
        expect(res.body.error).to.be.equal('Invalid authentication')
    })
})
