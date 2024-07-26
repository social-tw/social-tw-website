import { Unirep, UnirepApp } from '@unirep-app/contracts/typechain-types'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { jsonToBase64 } from '../src/middlewares/CheckReputationMiddleware'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { ReputationType, genProveReputationProof } from './utils/genProof'
import { airdropReputation } from './utils/reputation'
import { signUp } from './utils/signUp'

describe('POST /api/checkin', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let unirep: Unirep
    let app: UnirepApp
    let db: DB
    let chainId: number
    let nonce: number = 0
    const EPOCH_LENGTH = 100000

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep: _unirep, app: _app } = await deployContracts(
            EPOCH_LENGTH
        )
        // start server
        const {
            db: _db,
            prover,
            provider,
            synchronizer,
            chaiServer,
        } = await startServer(_unirep, _app)
        db = _db
        express = chaiServer
        sync = synchronizer
        unirep = _unirep
        app = _app
        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            _unirep,
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
        await stopServer('checkin', snapshot, sync, express)
    })

    it('should allow users with negative reputation to claim reputation', async function () {
        await airdropReputation(false, 1, userState, nonce, EPOCH_LENGTH)

        const epoch = await userState.sync.loadCurrentEpoch()

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

        const { publicSignals, proof } = await userState.genEpochKeyLiteProof()

        await express
            .post('/api/checkin')
            .set('content-type', 'application/json')
            .set('authentication', jsonToBase64(reputationProof))
            .send(
                stringifyBigInts({
                    publicSignals: publicSignals,
                    proof: proof,
                })
            )
            .then(async (res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('txHash')
                await ethers.provider.waitForTransaction(res.body.txHash)
            })
    })

    it('should fail if users with non-negative reputation tries to claim reputation', async function () {
        await airdropReputation(false, 2, userState, nonce, EPOCH_LENGTH)

        const epoch = await userState.sync.loadCurrentEpoch()

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

        const { publicSignals, proof } = await userState.genEpochKeyLiteProof()

        await express
            .post('/api/checkin')
            .set('content-type', 'application/json')
            .set('authentication', jsonToBase64(reputationProof))
            .send(
                stringifyBigInts({
                    publicSignals: publicSignals,
                    proof: proof,
                })
            )
            .then(async (res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Positive reputation user')
            })
    })
})
