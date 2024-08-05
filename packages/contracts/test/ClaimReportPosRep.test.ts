// @ts-ignore
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createMultipleUserIdentity,
    flattenProof,
    genNullifier,
    genProofAndVerify,
    genReportNonNullifierCircuitInput,
    genReportNullifierCircuitInput,
    genUserState,
    genVHelperIdentifier,
} from './utils'
import { ProofGenerationError } from './error'

describe('Claim Report Positive Reputation Test', function () {
    this.timeout(1000000)
    let unirep: Unirep
    let app: UnirepApp
    let chainId: number
    let upvoter: IdentityObject
    let reporter: IdentityObject
    let reporterEpochKey: bigint
    let reporterEpoch: number

    let snapshot: any
    const epochLength = 300
    const posReputation = 3
    const nullifierCircuit = 'reportNullifierProof'
    const nonNullifierCircuit = 'reportNonNullifierProof'
    const nullifierIdentifier = genVHelperIdentifier(
        'reportNullifierProofVerifierHelper'
    )
    const nonNullifierIdentifier = genVHelperIdentifier(
        'reportNonNullifierProofVerifierHelper'
    )
    let usedPublicSig: any
    let usedProof: any

    {
        before(async function () {
            snapshot = await ethers.provider.send('evm_snapshot', [])
        })
        after(async function () {
            await ethers.provider.send('evm_revert', [snapshot])
        })
    }

    before(async function () {
        try {
            const [deployer] = await ethers.getSigners()
            const contracts = await deployApp(deployer, epochLength)
            unirep = contracts.unirep
            app = contracts.app

            const users = createMultipleUserIdentity(2)
            upvoter = users[0]
            reporter = users[1]

            chainId = await unirep.chainid()

            const upvoterState = await genUserState(upvoter.id, app)
            const { publicSignals: upvoterSig, proof: upvoterPf } =
                await upvoterState.genUserSignUpProof()
            await app.userSignUp(
                upvoterSig,
                upvoterPf,
                upvoter.hashUserId,
                false
            )
            await app
                .userRegistry(upvoter.hashUserId)
                .then((res) => expect(res).to.be.true)
            console.log('upvoter register success...')
            upvoterState.stop()

            const reporterState = await genUserState(reporter.id, app)
            const { publicSignals: reporterSig, proof: reporterPf } =
                await reporterState.genUserSignUpProof()
            await app.userSignUp(
                reporterSig,
                reporterPf,
                reporter.hashUserId,
                false
            )
            await app
                .userRegistry(reporter.hashUserId)
                .then((res) => expect(res).to.be.true)
            console.log('reporter register success...')

            // reporter reported a post

            reporterState.stop()
        } catch (err) {
            console.error(err)
        }
    })

    /**
     * 1. succeed to claim rep to upvoter
     * 2. revert with used proof
     * 3. succeed to claim rep to reporter
     * 4. revert with used proof
     * 5. revert with invalid reportNullifierProof
     * 6. revert with wrong epoch for reportNullifierProof
     * 7. revert with invalid attesterId for reportNullifierProof
     * 8. revert with invalid reportNonNullifierProof
     * 9. revert with wrong epoch for reportNonNullifierProof
     * 10. revert with invalid attesterId for reportNonNullifierProof
     */

    it('should succeed to claim reputation to upvoter', async () => {
        const reportId = 0
        const currentNonce = 0
        const hashUserId = upvoter.hashUserId

        const attesterId = BigInt(app.address)
        const upvoterState = await genUserState(upvoter.id, app)
        const currentEpoch = await upvoterState.sync.loadCurrentEpoch()

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
            nullifierCircuit,
            reportNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const tx = await app.claimReportPosRep(
            usedPublicSig,
            usedProof,
            nullifierIdentifier,
            posReputation
        )
        await expect(tx)
            .to.emit(app, 'ClaimPosRep')
            .withArgs(publicSignals[0], currentEpoch)

        upvoterState.stop()
    })

    it('should revert with used proof', async () => {
        await expect(
            app.claimReportPosRep(
                usedPublicSig,
                usedProof,
                nullifierIdentifier,
                posReputation
            )
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    before(async () => {
        // reporter report the poster at this moment
        const reporterState = await genUserState(reporter.id, app)
        const { publicSignals: reporterPubSig, proof: reporterPf } =
            await reporterState.genEpochKeyProof({
                nonce: 0,
                epoch: 0,
                data: BigInt(0),
                revealNonce: false,
                attesterId: BigInt(app.address),
            })
        reporterEpochKey = reporterPubSig[0]
        reporterEpoch = await reporterState.sync.loadCurrentEpoch()

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])
    })

    it('should succeed to claim reputation to reporter', async () => {
        const reporterState = await genUserState(reporter.id, app)
        const identitySecret = reporter.id.secret
        const attesterId = BigInt(app.address)

        const currentNonce = 0
        const currentEpoch = await reporterState.sync.loadCurrentEpoch()

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: reporterEpochKey,
                identitySecret,
                reportedEpoch: reporterEpoch,
                currentEpoch,
                currentNonce,
                chainId,
                attesterId,
            })

        const { publicSignals, proof } = await genProofAndVerify(
            nonNullifierCircuit,
            reportNonNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const tx = await app.claimReportPosRep(
            usedPublicSig,
            usedProof,
            nonNullifierIdentifier,
            posReputation
        )
        await expect(tx)
            .to.emit(app, 'ClaimPosRep')
            .withArgs(publicSignals[0], currentEpoch)

        reporterState.stop()
    })

    it('should revert with used proof', async () => {
        await expect(
            app.claimReportPosRep(
                usedPublicSig,
                usedProof,
                nullifierIdentifier,
                posReputation
            )
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    it('should revert with used proof', async () => {
        await expect(
            app.claimReportPosRep(
                usedPublicSig,
                usedProof,
                nullifierIdentifier,
                posReputation
            )
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    it('should revert with wrong reportNullifierProof', async () => {
        const reportId = 1
        const currentNonce = 0
        const hashUserId = upvoter.hashUserId

        const attesterId = BigInt(app.address)
        const upvoterState = await genUserState(upvoter.id, app)
        const currentEpoch = await upvoterState.sync.loadCurrentEpoch()

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
            nullifierCircuit,
            reportNullifierCircuitInputs
        )

        const flattenedProof = flattenProof(proof)
        flattenedProof[0] = BigInt(0)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                nullifierIdentifier,
                posReputation
            )
        ).to.be.reverted

        upvoterState.stop()
    })

    it('should revert with wrong epoch for reportNullifierProof', async () => {
        const reportId = 1
        const currentNonce = 0
        const hashUserId = upvoter.hashUserId

        const attesterId = BigInt(app.address)
        const upvoterState = await genUserState(upvoter.id, app)
        const currentEpoch = 444

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
            nullifierCircuit,
            reportNullifierCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                nullifierIdentifier,
                posReputation
            )
        ).to.be.revertedWithCustomError(app, 'InvalidEpoch')

        upvoterState.stop()
    })

    it('should revert with wrong attester for reportNullifierProof', async () => {
        const reportId = 1
        const currentNonce = 0
        const hashUserId = upvoter.hashUserId

        const wrongAttester = BigInt(44444)
        const upvoterState = await genUserState(upvoter.id, app)
        const currentEpoch = await upvoterState.sync.loadCurrentEpoch()

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
            nullifierCircuit,
            reportNullifierCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                nullifierIdentifier,
                posReputation
            )
        ).to.be.reverted

        upvoterState.stop()
    })

    it('should revert with invalid reportNonNullifierProof', async () => {
        const reporterState = await genUserState(reporter.id, app)
        const identitySecret = reporter.id.secret
        const attesterId = BigInt(app.address)

        const currentNonce = 0
        const currentEpoch = await reporterState.sync.loadCurrentEpoch()

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: reporterEpochKey,
                identitySecret,
                reportedEpoch: reporterEpoch,
                currentEpoch,
                currentNonce,
                chainId,
                attesterId,
            })

        const { publicSignals, proof } = await genProofAndVerify(
            nonNullifierCircuit,
            reportNonNullifierCircuitInputs
        )

        const flattenedProof = flattenProof(proof)
        flattenedProof[0] = BigInt(0)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                nonNullifierIdentifier,
                posReputation
            )
        ).to.be.reverted
        reporterState.stop()
    })

    it('should revert with wrong reported epoch and wrong for reportNonNullifierProof', async () => {
        const identitySecret = reporter.id.secret
        const attesterId = BigInt(app.address)
        const wrongEpoch = BigInt(44444)

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: reporterEpochKey,
                identitySecret,
                reportedEpoch: reporterEpoch,
                currentEpoch: wrongEpoch,
                currentNonce: 0,
                chainId,
                attesterId,
            })

        const { publicSignals, proof } = await genProofAndVerify(
            nonNullifierCircuit,
            reportNonNullifierCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                nonNullifierIdentifier,
                posReputation
            )
        ).to.be.reverted
    })

    it('should revert with wrong attester for reportNonNullifierProof', async () => {
        const reporterState = await genUserState(reporter.id, app)
        const identitySecret = reporter.id.secret
        const attesterId = BigInt(13131)

        const currentNonce = 0
        const currentEpoch = await reporterState.sync.loadCurrentEpoch()

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: reporterEpochKey,
                identitySecret,
                reportedEpoch: reporterEpoch,
                currentEpoch,
                currentNonce,
                chainId,
                attesterId,
            })

        // this will not generate a proof since the attesterId would change the epochkey
        try {
            await genProofAndVerify(
                nonNullifierCircuit,
                reportNonNullifierCircuitInputs
            )
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template ReportNonNullifierProof_79 line: 42\n'
            )
        }
    })
})
