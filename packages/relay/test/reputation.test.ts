import { UserState } from '@unirep/core'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { signUp } from './utils/signUp'
import { insertReputationHistory } from './utils/sqlHelper'

describe('Reputation', () => {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let db: DB
    let chainId: number

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
        express = chaiServer
        sync = synchronizer
        db = _db

        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app,
            synchronizer
        )

        // initUserStatus
        var initUser = await userService.getLoginUser(db, '123', undefined)
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
        await stopServer('reputation', snapshot, sync, express)
    })

    it('should be able to get reputation history by fromEpoch and toEpoch', async () => {
        //TODO: Update here, use actual claim feature to insert reputation history 
        await insertReputationHistory(db)

        const res = await express.get(
            `/api/reputation/history?fromEpoch=2&toEpoch=5`
        )
        const reputations = res.body

        expect(res).to.have.status(200)
        expect(reputations).to.be.an('array').that.has.lengthOf(4)
    })

    it('should throw an error when fetching reputation history without fromEpoch', async () => {
        const res = await express.get('/api/reputation/history?toEpoch=5')
        expect(res).to.have.status(400)
        expect(res.body.error).equal('Invalid epoch')
    })

    it('should throw an error when fetching reputation history without toEpoch', async () => {
        const res = await express.get('/api/reputation/history?fromEpoch=2')
        expect(res).to.have.status(400)
        expect(res.body.error).equal('Invalid epoch')
    })
})
