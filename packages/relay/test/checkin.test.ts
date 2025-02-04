import { UnirepSocialCircuit } from '@unirep-app/circuits/src/types'
import {
    flattenProof,
    genDailyClaimCircuitInput,
    genNullifier,
    genProofAndVerify,
} from '@unirep-app/contracts/test/utils'
import { Unirep, UnirepApp } from '@unirep-app/contracts/typechain-types'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { deployContracts, startServer, stopServer } from './environment'
import { airdropReputation } from './utils/reputation'
import { signUp } from './utils/signup'
import { IdentityObject } from './utils/types'
import { createRandomUserIdentity, genUserState } from './utils/userHelper'

describe('POST /api/checkin', function () {
    let snapshot: any
    let unirep: Unirep
    let app: UnirepApp
    let db: DB
    let prover: any
    let provider: any
    let sync: UnirepSocialSynchronizer
    let express: ChaiHttp.Agent
    let user: IdentityObject
    let chainId: number
    let attesterId: bigint
    const EPOCH_LENGTH = 100000
    const DailyClaimProof = UnirepSocialCircuit.dailyClaimProof

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep: _unirep, app: _app } = await deployContracts(
            EPOCH_LENGTH
        )
        // start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(_unirep, _app)

        unirep = _unirep
        app = _app
        db = _db
        prover = _prover
        provider = _provider
        sync = synchronizer
        express = chaiServer

        user = createRandomUserIdentity()
        const userState = await signUp(user, {
            app,
            db,
            prover,
            provider,
            sync,
        })

        chainId = await unirep.chainid()
        attesterId = BigInt(sync.attesterId)

        userState.stop()
    })

    after(async function () {
        await stopServer('checkin', snapshot, sync, express)
    })

    it('should allow users with negative reputation to claim reputation', async function () {
        const userState = await genUserState(user.id, app, prover)
        await airdropReputation(false, 1, userState, unirep, express, provider)

        const identitySecret = user.id.secret
        const dailyEpoch = 1
        const dailyNullifier = genNullifier(user.id, dailyEpoch)
        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()

        const reputationProof = await userState.genProveReputationProof({
            maxRep: 1,
        })

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        const dailyClaimProof = await genProofAndVerify(
            DailyClaimProof,
            dailyClaimCircuitInputs
        )

        const flattenedProof = flattenProof(dailyClaimProof.proof)

        await express
            .post('/api/checkin')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals: dailyClaimProof.publicSignals,
                    proof: flattenedProof,
                })
            )
            .then(async (res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('txHash')
                await provider.waitForTransaction(res.body.txHash)
            })

        userState.stop()
    })

    it('should fail if users with non-negative reputation tries to claim reputation', async function () {
        const userState = await genUserState(user.id, app, prover)
        await airdropReputation(true, 2, userState, unirep, express, provider)

        const identitySecret = user.id.secret
        const dailyEpoch = 1
        const dailyNullifier = genNullifier(user.id, dailyEpoch)
        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()
        data[0] = BigInt(0)

        const reputationProof = await userState.genProveReputationProof({
            minRep: 1,
        })

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        try {
            await genProofAndVerify(DailyClaimProof, dailyClaimCircuitInputs)
            // If no error is thrown, fail the test
            expect.fail('Expected error was not thrown')
        } catch (error) {
            // Assert that the error is as expected
            expect(error).to.exist
        }

        userState.stop()
    })
})
