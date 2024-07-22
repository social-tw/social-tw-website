import { unirep, Unirep } from '@unirep-app/contracts/typechain-types'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { ReportStatus, ReportType, AdjudicateValue } from '../src/types'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { signUp } from './utils/signUp'

// Import from contracts package
import {
    createRandomUserIdentity,
    flattenProof,
    genNullifier,
    genProofAndVerify,
    genReportNullifierCircuitInput,
    genUserState,
    genVHelperIdentifier,
} from '../../contracts/test/utils'

describe('Reputation Claim', function () {
    this.timeout(1000000)
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let unirep: Unirep
    let db: DB
    let chainId: number
    let poster: UserState
    let reporter: UserState
    let voter: UserState

    const EPOCH_LENGTH = 100000
    const posReputation = 3
    const negReputation = 5
    const circuit = 'reportNullifierProof'
    const identifier = genVHelperIdentifier(
        'reportNullifierProofVerifierHelper'
    )

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        const { unirep: _unirep, app } = await deployContracts(EPOCH_LENGTH)
        const {
            db: _db,
            prover,
            provider,
            synchronizer,
            chaiServer,
        } = await startServer(_unirep, app)
        unirep = _unirep
        db = _db
        express = chaiServer
        sync = synchronizer

        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            _unirep,
            app,
            synchronizer
        )

        chainId = await unirep.chainid()

        // Create three users: poster, reporter, and voter
        poster = await signUp(
            await userService.getLoginUser(db, 'poster', undefined),
            userStateFactory,
            userService,
            synchronizer,
            ethers.Wallet.createRandom()
        )
        reporter = await signUp(
            await userService.getLoginUser(db, 'reporter', undefined),
            userStateFactory,
            userService,
            synchronizer,
            ethers.Wallet.createRandom()
        )
        voter = await signUp(
            await userService.getLoginUser(db, 'voter', undefined),
            userStateFactory,
            userService,
            synchronizer,
            ethers.Wallet.createRandom()
        )

        await Promise.all([poster, reporter, voter].map((u) => u.waitForSync()))

        // Simulate post creation
        const postId = '1'
        await db.create('Post', {
            postId,
            content: 'Test post',
            epochKey: poster.id.toString(),
            epoch: await sync.loadCurrentEpoch(),
            status: 1,
            transactionHash: ethers.utils.randomBytes(32).toString(),
        })

        // Simulate report creation
        const reportId = '1'
        await db.create('ReportHistory', {
            reportId,
            type: ReportType.POST,
            objectId: postId,
            reportorEpochKey: reporter.id.toString(),
            respondentEpochKey: poster.id.toString(),
            reason: 'Test reason',
            category: 1,
            reportEpoch: await sync.loadCurrentEpoch(),
            status: ReportStatus.VOTING,
        })

        // Simulate vote
        await db.update('ReportHistory', {
            where: { reportId },
            update: {
                adjudicatorsNullifier: [
                    {
                        nullifier: voter.id.toString(),
                        adjudicateValue: AdjudicateValue.AGREE,
                        claimed: false,
                    },
                ],
                adjudicateCount: 1,
                status: ReportStatus.WAITING_FOR_TRANSACTION,
            },
        })

        // Transition to next epoch to make the report claimable
        await ethers.provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await ethers.provider.send('evm_mine', [])
        await unirep.updateEpochIfNeeded(sync.attesterId)
        await sync.waitForSync()
    })

    after(async function () {
        await stopServer('reputation_claim', snapshot, sync, express)
    })

    beforeEach(async function () {
        const currentEpoch = await sync.loadCurrentEpoch()
        for (const user of [poster, reporter, voter]) {
            if ((await user.latestTransitionedEpoch()) < currentEpoch) {
                await user.genUserStateTransitionProof({
                    toEpoch: currentEpoch,
                })
                await user.waitForSync()
            }
        }
    })

    it('should be able to claim positive reputation', async function () {
        const currentEpoch = await sync.loadCurrentEpoch()
        const { publicSignals, proof } = await reporter.genEpochKeyProof({
            nonce: 0,
            epoch: currentEpoch,
        })

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

        const epochKey = reporter.getEpochKeys(currentEpoch, 0) as bigint
        const report = await db.findOne('ReportHistory', {
            where: {
                reportorEpochKey: epochKey.toString(),
            },
        })
        expect(report.positiveReputationClaimed).to.be.true
    })

    it('should be able to claim negative reputation', async function () {
        const currentEpoch = await sync.loadCurrentEpoch()
        const { publicSignals, proof } = await poster.genEpochKeyProof({
            nonce: 0,
            epoch: currentEpoch,
        })

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

        const epochKey = poster.getEpochKeys(currentEpoch, 0) as bigint
        const report = await db.findOne('ReportHistory', {
            where: {
                respondentEpochKey: epochKey.toString(),
            },
        })
        expect(report.negativeReputationClaimed).to.be.true
    })

    it('should fail to claim reputation with invalid proof', async function () {
        const currentEpoch = await sync.loadCurrentEpoch()
        const { publicSignals, proof } = await reporter.genEpochKeyProof({
            nonce: 0,
            epoch: currentEpoch,
        })

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
        expect(res.body.message).to.equal('Get Positive Reputation error')
    })

    it('should fail to claim reputation without required parameters', async function () {
        const res1 = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send({})

        expect(res1).to.have.status(400)
        expect(res1.body.error).to.equal('Invalid parameters')

        const res2 = await express
            .post('/api/reports/claimNegativeReputation')
            .set('content-type', 'application/json')
            .send({})

        expect(res2).to.have.status(400)
        expect(res2.body.error).to.equal('Invalid parameters')
    })
})
