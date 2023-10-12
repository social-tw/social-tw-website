import { deployContracts, startServer } from './environment'
import { ethers } from 'hardhat'
import { Server } from 'http'
import { UserStateFactory } from './utils/UserStateFactory'
import { DB } from 'anondb'
import { TransactionManager } from '../src/singletons/TransactionManager'

describe('POST /vote', function () {
    let snapshot: any
    let anondb: DB
    let tm: TransactionManager
    let express: Server
    let userStateFactory: UserStateFactory

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const { db, prover, provider, TransactionManager, server, synchronizer } =
            await startServer(unirep, app)

        anondb = db
        tm = TransactionManager
        express = server
        userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app,
            synchronizer
        )

        // TODO: create mock user, the logic was on epochKeyAction branch,
        // should merge that PR first, then rebase to main
    })

    after(async function () {
        await ethers.provider.send('evm_revert', [snapshot])
        express.close()
    })

    it('should vote for post', async function () {
        
    })

    it('should vote failed with wrong epoch', async function () {
        
    })

    it('shuold vote failed with wrong proof', async function () {
        
    })

    it('should vote failed with invalid post', async function () {
        
    })

    it('should vote failed with invalid vote action', async function () {
        
    })
})