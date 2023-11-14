import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'

import { UserState } from '@unirep/core'
import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

import { Server } from 'http'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { singUp } from './utils/signUp'
import { post } from './utils/post'

import { time } from '@nomicfoundation/hardhat-network-helpers'
import { Unirep } from '@unirep-app/contracts/typechain-types'
import { DB } from 'anondb'

describe('GET /counter', function () {
    let snapshot: any
    let express: Server
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let unirep: Unirep
    let anondb: DB
    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const contracts = await deployContracts(100000)
        // start server
        const { db, prover, provider, synchronizer, server } =
            await startServer(contracts.unirep, contracts.app)
        express = server
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
        userState = await singUp(
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
        ethers.provider.send('evm_revert', [snapshot])
        express.close()
    })

    it('should add the counter number increment after the user posted', async function () {
        let res = await post(userState)
        await ethers.provider.waitForTransaction(res.transaction)
        await sync.waitForSync()

        const epochKeys = (userState.getEpochKeys() as bigint[])
            .map((epk) => epk.toString())
            .reduce((acc, epk) => `${acc}_${epk}`)

        res = await fetch(`${HTTP_SERVER}/api/counter?epks=${epochKeys}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        }).then((r) => {
            return r.json()
        })

        expect(res.counter).equal(1)
    })

    it('should counter failed if number of epks is not 3', async function () {
        // one epoch key
        const epochKeys = (
            userState.getEpochKeys(undefined, 0) as bigint
        ).toString()

        const res: any = await fetch(
            `${HTTP_SERVER}/api/counter?epks=${epochKeys}`,
            {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                },
            }
        ).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal('wrong number of epks')
    })

    // TODO: add vote test & comment test after the apis are done

    // put this test in the end since this test will
    // go to next epoch
    it('should delete the EpochKeyAction table after the epoch ended', async function () {
        const epoch = sync.calcCurrentEpoch()
        const epochRemainingTime = sync.calcEpochRemainingTime()
        // add 10s to make sure this epoch ended
        await time.increase(epochRemainingTime + 20)
        await unirep._updateEpochIfNeeded(sync.attesterId)
        await sync.waitForSync()

        const rows = await anondb.count('EpochKeyAction', {
            epoch: epoch,
        })

        expect(rows).equal(0)
    })
})
