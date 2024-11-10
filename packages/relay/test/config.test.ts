import { Unirep, UnirepApp } from '@unirep-app/contracts/typechain-types'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { ETH_PROVIDER_URL } from '../src/config'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { deployContracts, startServer, stopServer } from './environment'

describe('GET /api/config', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let unirep: Unirep
    let app: UnirepApp
    let db: DB
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
    })

    after(async function () {
        await stopServer('config', snapshot, sync, express)
    })

    it('should return the correct configuration', async function () {
        const res = await express
            .get('/api/config')
            .set('content-type', 'application/json')

        expect(res).to.have.status(200)
        expect(res.body).to.have.property('UNIREP_ADDRESS')
        expect(res.body).to.have.property('APP_ADDRESS')
        expect(res.body).to.have.property('ETH_PROVIDER_URL')
        expect(res.body).to.have.property('EPOCH_LENGTH')

        expect(res.body.UNIREP_ADDRESS).to.equal(unirep.address)
        expect(res.body.APP_ADDRESS).to.equal(app.address)
        expect(res.body.ETH_PROVIDER_URL).to.equal(ETH_PROVIDER_URL)

        const expectedEpochLength =
            await sync.unirepContract.attesterEpochLength(
                BigInt(app.address).toString(),
            )
        expect(res.body.EPOCH_LENGTH).to.equal(expectedEpochLength)
    })

    it('should return the correct data types', async function () {
        const res = await express
            .get('/api/config')
            .set('content-type', 'application/json')

        expect(res).to.have.status(200)
        expect(res.body.UNIREP_ADDRESS).to.be.a('string')
        expect(res.body.APP_ADDRESS).to.be.a('string')
        expect(res.body.ETH_PROVIDER_URL).to.be.a('string')
        expect(res.body.EPOCH_LENGTH).to.be.a('number')
    })
})
