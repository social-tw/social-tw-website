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
import { stringifyBigInts } from '@unirep/utils'
import { InvalidParametersError } from '../src/types/InternalError'
import {
    createRandomUserIdentity,
    genNullifier,
    genProofAndVerify,
    genReportNullifierCircuitInput,
} from '../../circuits/test/utils'
import {
    flattenProof,
    genUserState,
    genVHelperIdentifier,
} from '../../contracts/test/utils'
import { deployApp } from '../../contracts/scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../../contracts/typechain-types'
import { IdentityObject } from '../../contracts/test/types'

describe('Reputation Claim API', function () {
    this.timeout(1000000)
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let db: DB
    let unirep: Unirep
    let app: UnirepApp
    let user: IdentityObject

    const chainId = 31337
    const epochLength = 300
    const posReputation = 3
    const negReputation = 5
    const circuit = 'reportNullifierProof'
    const identifier = genVHelperIdentifier(
        'reportNullifierProofVerifierHelper'
    )

    {
        before(async function () {
            snapshot = await ethers.provider.send('evm_snapshot', [])
        })
        after(async function () {
            await ethers.provider.send('evm_revert', [snapshot])
        })
    }

    before(async function () {
        const [deployer] = await ethers.getSigners()
        const contracts = await deployApp(deployer, epochLength)
        unirep = contracts.unirep
        app = contracts.app
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
        user = createRandomUserIdentity()
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
    })

    after(async function () {
        await stopServer('reputation_claim', snapshot, sync, express)
    })

    beforeEach(async function () {
        const currentEpoch = await sync.loadCurrentEpoch()
        if ((await userState.latestTransitionedEpoch()) < currentEpoch) {
            await userState.genUserStateTransitionProof({
                toEpoch: currentEpoch,
            })
            await userState.waitForSync()
        }
    })

    it('should claim positive reputation successfully', async function () {
        const reportId = 0
        const currentNonce = 0
        const hashUserId = user.hashUserId

        const attesterId = BigInt(219090124810)
        const userState = await genUserState(user.id, app)
        const currentEpoch = await userState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, reportId)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNullifierCircuitInputs
        )

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals,
                    proof: flattenProof(proof),
                    change: posReputation,
                })
            )

        expect(res).to.have.status(200)
        expect(res.body.message).to.equal('Success get Positive Reputation')

        const epochKey = userState.getEpochKeys(
            currentEpoch,
            currentNonce
        ) as bigint
        const report = await db.findOne('ReportHistory', {
            where: {
                reportorEpochKey: epochKey.toString(),
            },
        })
        console.log(report)
        expect(report.positiveReputationClaimed).to.be.true
    })

    it('should claim negative reputation successfully', async function () {
        const reportId = 1
        const currentNonce = 1
        const hashUserId = user.hashUserId

        const attesterId = BigInt(219090124810)
        const currentEpoch = await userState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, reportId)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNullifierCircuitInputs
        )

        const res = await express
            .post('/api/reports/claimNegativeReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals,
                    proof: flattenProof(proof),
                    change: negReputation,
                })
            )

        expect(res).to.have.status(200)
        expect(res.body.message).to.equal('Success get Negative Reputation')

        const epochKey = userState.getEpochKeys(
            currentEpoch,
            currentNonce
        ) as bigint
        const report = await db.findOne('ReportHistory', {
            where: {
                respondentEpochKey: epochKey.toString(),
            },
        })
        expect(report.negativeReputationClaimed).to.be.true
    })

    it('should fail to claim reputation with invalid proof', async function () {
        const reportId = 2
        const currentNonce = 2
        const hashUserId = user.hashUserId

        const attesterId = BigInt(219090124810)
        const currentEpoch = await userState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, reportId)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNullifierCircuitInputs
        )

        // Invalidate the proof
        const invalidProof = flattenProof(proof)
        invalidProof[0] = BigInt(0)

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals,
                    proof: invalidProof,
                    change: posReputation,
                })
            )

        expect(res).to.have.status(500)
        expect(res.body.message).to.equal('Get 0 Reputation error')
    })

    it('should fail to claim reputation without required parameters', async function () {
        const res1 = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send({})

        expect(res1).to.have.status(400)
        expect(res1.body).to.deep.equal({
            error: InvalidParametersError.message,
        })

        const res2 = await express
            .post('/api/reports/claimNegativeReputation')
            .set('content-type', 'application/json')
            .send({})

        expect(res2).to.have.status(400)
        expect(res2.body).to.deep.equal({
            error: InvalidParametersError.message,
        })
    })

    it('should fail to claim reputation with wrong epoch', async function () {
        const reportId = 3
        const currentNonce = 0
        const hashUserId = user.hashUserId

        const attesterId = BigInt(219090124810)
        const wrongEpoch = 444

        const reportNullifier = genNullifier(hashUserId, reportId)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch: wrongEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNullifierCircuitInputs
        )

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals,
                    proof: flattenProof(proof),
                    change: posReputation,
                })
            )

        expect(res).to.have.status(500)
        expect(res.body.message).to.equal('Get 0 Reputation error')
    })

    it('should fail to claim reputation with wrong attester', async function () {
        const reportId = 4
        const currentNonce = 1
        const hashUserId = user.hashUserId

        const wrongAttester = BigInt(44444)
        const currentEpoch = await userState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, reportId)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId: wrongAttester,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNullifierCircuitInputs
        )

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals,
                    proof: flattenProof(proof),
                    change: posReputation,
                })
            )

        expect(res).to.have.status(500)
        expect(res.body.message).to.equal('Get 0 Reputation error')
    })
})
