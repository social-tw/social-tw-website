import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { jsonToBase64 } from '../src/middlewares/CheckReputationMiddleware'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { Post } from '../src/types'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { ReputationType, genProveReputationProof } from './utils/genProof'
import { post } from './utils/post'
import { signUp } from './utils/signUp'

describe('CheckReputation', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let chainId: number

    const EPOCH_LENGTH = 100000

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(EPOCH_LENGTH)
        // start server
        const { db, prover, provider, synchronizer, chaiServer } =
            await startServer(unirep, app)
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

        chainId = await unirep.chainid()
    })

    after(async function () {
        await stopServer('checkReputation', snapshot, sync, express)
    })

    it('should pass the check reputation middleware with positive reputation', async function () {
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
        await post(express, userState, authentication).then(async (res) => {
            await ethers.provider.waitForTransaction(res.txHash)
            await sync.waitForSync()
        })
        await express.get('/api/post/0').then((res) => {
            expect(res).to.have.status(200)
            const curPost = res.body as Post
            expect(curPost.status).to.equal(1)
        })
    })

    it('should fail the check reputation middleware with negative reputation', async function () {
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
    })

    it('should fail the check reputation middleware with wrong reputation proof', async function () {
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
