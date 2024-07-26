import { Unirep } from '@unirep-app/contracts/typechain-types'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import {
    ReportStatus,
    ReportType,
    AdjudicateValue,
    User,
    ReportHistory,
    Adjudicator,
} from '../src/types'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { signUp } from './utils/signUp'

// Import from contracts package
import {
    flattenProof,
    genNullifier,
    genProofAndVerify,
    genReportNegRepCircuitInput,
    genReportNullifierCircuitInput,
} from '../../contracts/test/utils'
import { EpochKeyLiteProof } from '@unirep/circuits'
import { genReportNullifier } from '../test/utils/genNullifier'
import {
    RepChangeType,
    RepUserType,
    ReputationType,
} from '../src/types/Reputation'

describe('Reputation Claim', function () {
    this.timeout(1000000)
    let snapshot: any
    let express: ChaiHttp.Agent
    let sync: UnirepSocialSynchronizer
    let unirep: Unirep
    let db: DB
    let chainId: number
    let poster: User
    let reporter: User
    let voter: User
    let usedPublicSig: any
    let usedProof: any
    let posterUserState: UserState
    let voterUserState: UserState
    let repoterUserState: UserState
    let repoterEpochKey: EpochKeyLiteProof
    let posterEpochKey: EpochKeyLiteProof
    let voterEpochKey: EpochKeyLiteProof
    let attesterId: bigint
    let reportedEpochKey: bigint
    let nullifier: BigInt

    const EPOCH_LENGTH = 3000
    const PositiveCircuit = 'reportNullifierProof'
    const NegativeCircuit = 'reportNegRepProof'
    const reportId = '1'
    const postId = 1

    const upsertAdjudicatorsNullifier = (
        nullifier: string,
        adjudicateValue: AdjudicateValue,
        report: ReportHistory
    ): Adjudicator[] => {
        const newAdjudicator = {
            nullifier: nullifier,
            adjudicateValue: adjudicateValue,
            claimed: false,
        }

        return report.adjudicatorsNullifier
            ? [...report.adjudicatorsNullifier, newAdjudicator]
            : [newAdjudicator]
    }

    async function findReportWithNullifier(
        db: DB,
        epoch: number,
        nullifier: string,
        status: ReportStatus
    ) {
        const reports = await db.findMany('ReportHistory', {
            where: {
                reportEpoch: epoch,
                status: status,
            },
        })

        return reports.find((report) =>
            report.adjudicatorsNullifier.some(
                (adj) => adj.nullifier === nullifier
            )
        )
    }

    before(async function () {
        this.timeout(6000000)
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep: _unirep, app } = await deployContracts(EPOCH_LENGTH)
        // start server
        const {
            db: _db,
            prover,
            provider,
            synchronizer,
            chaiServer,
        } = await startServer(_unirep, app)
        db = _db
        express = chaiServer
        sync = synchronizer
        unirep = _unirep
        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            _unirep,
            app,
            synchronizer
        )

        poster = await userService.getLoginUser(db, 'poster', undefined)
        const wallet = ethers.Wallet.createRandom()
        posterUserState = await signUp(
            poster,
            userStateFactory,
            userService,
            synchronizer,
            wallet
        )
        await posterUserState.waitForSync()
        const hasSignedUp = await posterUserState.hasSignedUp()
        expect(hasSignedUp).equal(true)
        console.log('poster register success...')

        reporter = await userService.getLoginUser(db, 'reporter', undefined)
        const wallet2 = ethers.Wallet.createRandom()
        repoterUserState = await signUp(
            reporter,
            userStateFactory,
            userService,
            synchronizer,
            wallet2
        )
        await repoterUserState.waitForSync()
        const hasSignedUp2 = await repoterUserState.hasSignedUp()
        expect(hasSignedUp2).equal(true)
        console.log('reporter register success...')

        voter = await userService.getLoginUser(db, 'voter', undefined)
        const wallet3 = ethers.Wallet.createRandom()
        voterUserState = await signUp(
            voter,
            userStateFactory,
            userService,
            synchronizer,
            wallet3
        )
        await voterUserState.waitForSync()
        const hasSignedUp3 = await voterUserState.hasSignedUp()
        expect(hasSignedUp3).equal(true)
        console.log('voter register success...')

        chainId = await unirep.chainid()

        repoterEpochKey = await repoterUserState.genEpochKeyLiteProof()
        posterEpochKey = await posterUserState.genEpochKeyLiteProof()
        voterEpochKey = await voterUserState.genEpochKeyLiteProof()

        attesterId = posterUserState.sync.attesterId

        // Simulate post creation
        await db.create('Post', {
            postId,
            content: 'Test post',
            epochKey: poster.hashUserId,
            epoch: await sync.loadCurrentEpoch(),
            status: 1,
            transactionHash: ethers.utils.randomBytes(32).toString(),
        })

        // Simulate report creation
        await db.create('ReportHistory', {
            reportId,
            type: ReportType.POST,
            objectId: postId,
            reportorEpochKey: repoterEpochKey.epochKey.toString(),
            respondentEpochKey: posterEpochKey.epochKey.toString(),
            reason: 'Test reason',
            category: 1,
            reportEpoch: await sync.loadCurrentEpoch(),
            status: ReportStatus.VOTING,
        })

        const { publicSignals: postPubSig, proof: postPf } =
            await posterUserState.genEpochKeyProof({
                nonce: 0,
                epoch: 0,
                data: BigInt(0),
                revealNonce: false,
                attesterId,
            })
        reportedEpochKey = postPubSig[0]

        // Simulate vote
        nullifier = genReportNullifier(reportId)
        console.log('nullifier: ', nullifier.toString())
        const adjudicateValue = AdjudicateValue.AGREE
        const report = await db.findOne('ReportHistory', {
            where: {
                reportId: '1',
            },
        })
        const adjudicatorsNullifier = upsertAdjudicatorsNullifier(
            nullifier.toString(),
            adjudicateValue,
            report
        )
        const adjudicateCount = (report.adjudicateCount ?? 0) + 1
        await db.update('ReportHistory', {
            where: {
                reportId,
            },
            update: {
                adjudicatorsNullifier,
                adjudicateCount,
                status: ReportStatus.COMPLETED,
            },
        })
    })

    after(async function () {
        await stopServer('reputation_claim', snapshot, sync, express)
    })

    it('should reporter be able to claim positive reputation', async function () {
        const currentNonce = 1
        const hashUserId = reporter.hashUserId
        const attesterId = BigInt(sync.attesterId)
        const currentEpoch = await repoterUserState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, 1)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId: 1,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            PositiveCircuit,
            reportNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: repoterEpochKey.publicSignals,
                    proof: repoterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.REPORTER,
                })
            )
        expect(res).to.have.status(200)
        const message = res.body.message
        expect(message)
            .to.have.property('txHash')
            .that.matches(/^0x[a-fA-F0-9]{64}$/)
        expect(message).to.have.property('reportId').that.equals(reportId)
        expect(message).to.have.property('epoch').that.equals(currentEpoch)
        expect(message)
            .to.have.property('epochKey')
            .that.equals(repoterEpochKey.epochKey.toString())
        expect(message)
            .to.have.property('type')
            .that.equals(ReputationType.REPORT_SUCCESS)
        expect(message)
            .to.have.property('score')
            .that.equals(RepChangeType.REPORTER_REP)

        const report = await db.findOne('ReportHistory', {
            where: {
                reportorEpochKey: repoterEpochKey.epochKey.toString(),
            },
        })
        expect(report.reportorClaimedRep).equal(1)

        // 验证 ReputationHistory 记录
        const reputationHistory = await db.findOne('ReputationHistory', {
            where: {
                transactionHash: message.txHash,
            },
        })
        expect(reputationHistory).to.not.be.null
        expect(reputationHistory.epoch).to.equal(currentEpoch)
        expect(reputationHistory.epochKey).to.equal(
            repoterEpochKey.epochKey.toString()
        )
        expect(reputationHistory.score).to.equal(RepChangeType.REPORTER_REP)
        expect(reputationHistory.type).to.equal(ReputationType.REPORT_SUCCESS)
        expect(reputationHistory.reportId).to.equal(reportId)
    })

    it('should reporter be able to claim negative reputation', async function () {
        // reset HistoryReport reportorClaimedRep to 0
        await db.update('ReportHistory', {
            where: {
                reportorEpochKey: repoterEpochKey.epochKey.toString(),
            },
            update: {
                reportorClaimedRep: 0,
            },
        })

        const currentNonce = 1
        const hashUserId = reporter.hashUserId
        const attesterId = BigInt(sync.attesterId)
        const currentEpoch = await repoterUserState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, 1)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId: 1,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            PositiveCircuit,
            reportNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const res = await express
            .post('/api/reports/claimNegativeReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: repoterEpochKey.publicSignals,
                    proof: repoterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.REPORTER,
                })
            )
        expect(res).to.have.status(200)
        const message = res.body.message
        expect(message)
            .to.have.property('txHash')
            .that.matches(/^0x[a-fA-F0-9]{64}$/)
        expect(message).to.have.property('reportId').that.equals(reportId)
        expect(message).to.have.property('epoch').that.equals(currentEpoch)
        expect(message)
            .to.have.property('epochKey')
            .that.equals(repoterEpochKey.epochKey.toString())
        expect(message)
            .to.have.property('type')
            .that.equals(ReputationType.REPORT_FAILURE)
        expect(message)
            .to.have.property('score')
            .that.equals(RepChangeType.FAILED_REPORTER_REP)

        const report = await db.findOne('ReportHistory', {
            where: {
                reportorEpochKey: repoterEpochKey.epochKey.toString(),
            },
        })
        expect(report.reportorClaimedRep).equal(1)

        const reputationHistory = await db.findOne('ReputationHistory', {
            where: {
                transactionHash: message.txHash,
            },
        })
        expect(reputationHistory).to.not.be.null
        expect(reputationHistory.epoch).to.equal(currentEpoch)
        expect(reputationHistory.epochKey).to.equal(
            repoterEpochKey.epochKey.toString()
        )
        expect(reputationHistory.score).to.equal(
            RepChangeType.FAILED_REPORTER_REP
        )
        expect(reputationHistory.type).to.equal(ReputationType.REPORT_FAILURE)
        expect(reputationHistory.reportId).to.equal(reportId)
    })

    it('should poster be able to claim poster negative reputation', async function () {
        const identitySecret = posterUserState.id.secret
        const currentNonce = 0

        const attesterId = BigInt(sync.attesterId)
        const currentEpoch = await posterUserState.sync.loadCurrentEpoch()

        const type = 0
        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch: 0,
            currentEpoch,
            currentNonce,
            chainId,
            attesterId,
            type,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            NegativeCircuit,
            reportNegRepCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const res = await express
            .post('/api/reports/claimNegativeReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: posterEpochKey.publicSignals,
                    proof: posterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.POSTER,
                })
            )

        expect(res).to.have.status(200)
        const message = res.body.message
        expect(message)
            .to.have.property('txHash')
            .that.matches(/^0x[a-fA-F0-9]{64}$/)
        expect(message).to.have.property('reportId').that.equals(reportId)
        expect(message).to.have.property('epoch').that.equals(currentEpoch)
        expect(message)
            .to.have.property('epochKey')
            .that.equals(posterEpochKey.epochKey.toString())
        expect(message)
            .to.have.property('type')
            .that.equals(ReputationType.BE_REPORTED)
        expect(message)
            .to.have.property('score')
            .that.equals(RepChangeType.POSTER_REP)

        const report = await db.findOne('ReportHistory', {
            where: {
                reportorEpochKey: repoterEpochKey.epochKey.toString(),
            },
        })
        expect(report.reportorClaimedRep).equal(1)

        const reputationHistory = await db.findOne('ReputationHistory', {
            where: {
                transactionHash: message.txHash,
            },
        })
        expect(reputationHistory).to.not.be.null
        expect(reputationHistory.epoch).to.equal(currentEpoch)
        expect(reputationHistory.epochKey).to.equal(
            posterEpochKey.epochKey.toString()
        )
        expect(reputationHistory.score).to.equal(RepChangeType.POSTER_REP)
        expect(reputationHistory.type).to.equal(ReputationType.BE_REPORTED)
        expect(reputationHistory.reportId).to.equal(reportId)
    })

    // voter claim positive reputation
    it('should voter be able to claim voter positive reputation', async function () {
        const currentNonce = 0
        const hashUserId = voter.hashUserId

        const attesterId = BigInt(sync.attesterId)
        const currentEpoch = await voterUserState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, 1)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId: 1,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            PositiveCircuit,
            reportNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: voterEpochKey.publicSignals,
                    proof: voterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.VOTER,
                    nullifier: nullifier.toString(),
                })
            )

        expect(res).to.have.status(200)
        const message = res.body.message
        expect(message)
            .to.have.property('txHash')
            .that.matches(/^0x[a-fA-F0-9]{64}$/)
        expect(message).to.have.property('reportId').that.equals(reportId)
        expect(message).to.have.property('epoch').that.equals(currentEpoch)
        expect(message)
            .to.have.property('epochKey')
            .that.equals(voterEpochKey.epochKey.toString())
        expect(message)
            .to.have.property('type')
            .that.equals(ReputationType.ADJUDICATE)
        expect(message)
            .to.have.property('score')
            .that.equals(RepChangeType.VOTER_REP)

        const report = await db.findOne('ReportHistory', {
            where: {
                reportorEpochKey: repoterEpochKey.epochKey.toString(),
            },
        })
        expect(report.reportorClaimedRep).equal(1)

        const reputationHistory = await db.findOne('ReputationHistory', {
            where: {
                transactionHash: message.txHash,
            },
        })
        expect(reputationHistory).to.not.be.null
        expect(reputationHistory.epoch).to.equal(currentEpoch)
        expect(reputationHistory.epochKey).to.equal(
            voterEpochKey.epochKey.toString()
        )
        expect(reputationHistory.score).to.equal(RepChangeType.VOTER_REP)
        expect(reputationHistory.type).to.equal(ReputationType.ADJUDICATE)
        expect(reputationHistory.reportId).to.equal(reportId)
    })

    it('should fail when reporter tries to claim positive reputation twice', async function () {
        const currentNonce = 1
        const hashUserId = reporter.hashUserId
        const attesterId = BigInt(sync.attesterId)
        const currentEpoch = await repoterUserState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, 1)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId: 1,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            PositiveCircuit,
            reportNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: repoterEpochKey.publicSignals,
                    proof: repoterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.REPORTER,
                })
            )
        expect(res).to.have.status(400)
        expect(res.body.error).to.include('User has already claimed')
    })

    it('should fail when voter tries to claim positive reputation twice', async function () {
        const currentNonce = 0
        const hashUserId = voter.hashUserId

        const attesterId = BigInt(sync.attesterId)
        const currentEpoch = await voterUserState.sync.loadCurrentEpoch()

        const reportNullifier = genNullifier(hashUserId, 1)
        const reportNullifierCircuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId: 1,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            PositiveCircuit,
            reportNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: voterEpochKey.publicSignals,
                    proof: voterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.VOTER,
                    nullifier: nullifier.toString(),
                })
            )

        expect(res).to.have.status(400)
        expect(res.body.error).to.include('User has already claimed')
    })

    it('should fail when poster tries to claim negative reputation twice', async function () {
        const identitySecret = posterUserState.id.secret
        const currentNonce = 0

        const attesterId = BigInt(sync.attesterId)
        const currentEpoch = await posterUserState.sync.loadCurrentEpoch()

        const type = 0
        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch: 0,
            currentEpoch,
            currentNonce,
            chainId,
            attesterId,
            type,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            NegativeCircuit,
            reportNegRepCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const res = await express
            .post('/api/reports/claimNegativeReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: posterEpochKey.publicSignals,
                    proof: posterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.POSTER,
                })
            )

        expect(res).to.have.status(400)
        expect(res.body.error).to.include('User has already claimed')
    })

    it('should fail when voter tries to claim positive reputation with wrong nullifier', async function () {
        const wrongNullifier = genReportNullifier('3')

        const res = await express
            .post('/api/reports/claimPositiveReputation')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    reportId: reportId,
                    publicSignals: voterEpochKey.publicSignals,
                    proof: voterEpochKey.proof,
                    claimSignals: usedPublicSig,
                    claimProof: usedProof,
                    repUserType: RepUserType.VOTER,
                    nullifier: wrongNullifier.toString(),
                })
            )

        expect(res).to.have.status(400)
        expect(res.body.error).to.include('Invalid report nullifier')
    })
})
