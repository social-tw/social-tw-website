import { ethers } from 'hardhat'
import { expect } from 'chai'

import { UserState } from '@unirep/core'
import { deployContracts, startServer, stopServer } from './environment'

import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { signUp } from './utils/signUp'
import { post } from './utils/post'

import { Unirep } from '@unirep-app/contracts/typechain-types'
import { DB } from 'anondb'

describe('GET /counter', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let unirep: Unirep
    let anondb: DB
    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // deploy contracts
        const contracts = await deployContracts(100000)
        // start server
        const { db, prover, provider, synchronizer, chaiServer } =
            await startServer(contracts.unirep, contracts.app)
        express = chaiServer
        sync = synchronizer
        unirep = contracts.unirep
        anondb = db
        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            contracts.app,
            synchronizer
        )

        // initUserStatus
        const initUser = await userService.getLoginUser(db, '123', undefined)
        userState = await signUp(
            initUser,
            userStateFactory,
            userService,
            synchronizer
        )

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()
        expect(hasSignedUp).equal(true)
    })

    after(async function () {
        await stopServer('counter', snapshot, sync, express)
    })

    it('should add the counter number increment after the user posted', async function () {
        let res = await post(express, userState)
        await ethers.provider.waitForTransaction(res.transaction)
        await sync.waitForSync()

        const epochKeys = (userState.getEpochKeys() as bigint[])
            .map((epk) => epk.toString())
            .reduce((acc, epk) => `${acc}_${epk}`)

        res = await express
            .get(`/api/counter?epks=${epochKeys}`)
            .set('content-type', 'application/json')

        expect(res.body.counter).equal(1)
    })

    it('should counter failed if number of epks is not 3', async function () {
        // one epoch key
        const epochKeys = (
            userState.getEpochKeys(undefined, 0) as bigint
        ).toString()

        await express
            .get(`/api/counter?epks=${epochKeys}`)
            .set('content-type', 'application/json')
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('wrong number of epks')
            })
    })

    // TODO: add vote test & comment test after the apis are done

    // put this test in the end since this test will
    // go to next epoch
    it('should delete the EpochKeyAction table after the epoch ended', async function () {
        const epoch = await sync.loadCurrentEpoch()
        const epochRemainingTime = sync.calcEpochRemainingTime()

        // add epoch time to make sure this epoch ended
        await ethers.provider.send('evm_increaseTime', [
            epochRemainingTime + 1000,
        ])

        await unirep.updateEpochIfNeeded(sync.attesterId).then((t) => t.wait())

        await sync.waitForSync()

        const rows = await anondb.count('EpochKeyAction', {
            epoch: epoch,
        })

        expect(rows).equal(0)
    })
})
