import { expect } from 'chai'
import { ethers } from 'hardhat'

import { stringifyBigInts } from '@unirep/utils'
import { userService } from '../src/services/UserService'
import { deployContracts, startServer, stopServer } from './environment'
import { post } from './utils/post'
import { createRandomUserIdentity, genUserState } from './utils/userHelper'

import { Unirep, UnirepApp } from '@unirep-app/contracts/typechain-types'
import { DB } from 'anondb'
import { jsonToBase64 } from '../src/middlewares/CheckReputationMiddleware'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { genProveReputationProof, ReputationType } from './utils/genProof'
import { IdentityObject } from './utils/types'

describe('GET /counter', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let unirep: Unirep
    let app: UnirepApp
    let db: DB
    let authentication: string
    let user: IdentityObject
    let prover: any
    let provider: any
    let sync: UnirepSocialSynchronizer

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // deploy contracts
        const { unirep: _unirep, app: _app } = await deployContracts(100000)
        // start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(_unirep, _app)
        express = chaiServer
        unirep = _unirep
        db = _db
        app = _app
        prover = _prover
        provider = _provider
        sync = synchronizer

        user = createRandomUserIdentity()
        const userState = await genUserState(user.id, app, db, prover)
        const { publicSignals, _snarkProof: proof } =
            await userState.genUserSignUpProof()
        const txHash = await userService.signup(
            stringifyBigInts(publicSignals),
            proof,
            user.hashUserId,
            false,
            sync
        )
        await provider.waitForTransaction(txHash)

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()
        expect(hasSignedUp).equal(true)

        const epoch = await sync.loadCurrentEpoch()
        const chainId = await unirep.chainid()

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

        authentication = jsonToBase64(reputationProof)

        userState.stop()
    })

    after(async function () {
        await stopServer('counter', snapshot, sync, express)
    })

    it('should add the counter number increment after the user posted', async function () {
        const userState = await genUserState(user.id, app, db, prover)
        let txHash = await post(express, userState, authentication)
        await provider.waitForTransaction(txHash)
        await userState.waitForSync()

        const epochKeys = (userState.getEpochKeys() as bigint[])
            .map((epk) => epk.toString())
            .reduce((acc, epk) => `${acc}_${epk}`)

        const res = await express
            .get(`/api/counter?epks=${epochKeys}`)
            .set('content-type', 'application/json')

        expect(res.body.counter).equal(1)

        userState.stop()
    })

    it('should counter failed if number of epks is not 3', async function () {
        const userState = await genUserState(user.id, app, db, prover)
        // one epoch key
        const epochKeys = (
            userState.getEpochKeys(undefined, 0) as bigint
        ).toString()

        await express
            .get(`/api/counter?epks=${epochKeys}`)
            .set('content-type', 'application/json')
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Wrong number of epoch keys')
            })

        userState.stop()
    })

    // TODO: add vote test & comment test after the apis are done

    // put this test in the end since this test will
    // go to next epoch
    it('should delete the EpochKeyAction table after the epoch ended', async function () {
        const epoch = sync.calcCurrentEpoch()
        const epochRemainingTime = sync.calcEpochRemainingTime()

        // add epoch time to make sure this epoch ended
        await provider.send('evm_increaseTime', [epochRemainingTime + 1000])

        await unirep.updateEpochIfNeeded(sync.attesterId).then((t) => t.wait())

        await sync.waitForSync()

        const rows = await db.count('EpochKeyAction', {
            epoch: { lte: epoch },
        })

        expect(rows).equal(0)
    })
})
