// @ts-ignore
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { ProofGenerationError } from './error'
import { IdentityObject } from './types'
import {
    createMultipleUserIdentity,
    flattenProof,
    genProofAndVerify,
    genReportNonNullifierCircuitInput,
    genUserState,
    genVHelperIdentifier,
} from './utils'

describe('Claim Report Negative Reputation Test', function () {
    this.timeout(1000000)
    let unirep: Unirep
    let app: UnirepApp
    let chainId: number
    let attesterId: bigint
    let users: IdentityObject[]
    let poster: IdentityObject
    let reporter: IdentityObject
    let posterEpoch: number
    let posterEpochKey: bigint
    let reporterEpoch: number
    let reporterEpochKey: bigint

    let snapshot: any
    const epochLength = 300
    const posterPunishment = 5
    const reporterPunishment = 1
    const circuit = 'reportNonNullifierProof'
    const identifier = genVHelperIdentifier(
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

            users = createMultipleUserIdentity(2)
            poster = users[0]
            reporter = users[1]

            chainId = await unirep.chainid()

            // poster sign up
            let posterState = await genUserState(poster.id, app)
            attesterId = posterState.sync.attesterId
            const { publicSignals: posterPubSig, proof: posterPf } =
                await posterState.genUserSignUpProof()
            await app.userSignUp(
                posterPubSig,
                posterPf,
                poster.hashUserId,
                false
            )
            await app
                .userRegistry(poster.hashUserId)
                .then((res) => expect(res).to.be.true)
            console.log('poster registered successfully...')
            posterState.stop()

            // reporter sign up
            const reporterState = await genUserState(reporter.id, app)
            const { publicSignals: reporterPubSig, proof: reporterPf } =
                await reporterState.genUserSignUpProof()
            await app.userSignUp(
                reporterPubSig,
                reporterPf,
                reporter.hashUserId,
                false
            )
            await app
                .userRegistry(reporter.hashUserId)
                .then((res) => expect(res).to.be.true)
            console.log('reporter registered successfully...')
            reporterState.stop()

            // poster posting in the 0 epoch
            posterState = await genUserState(poster.id, app)
            const content = 'Bad Words :('
            const { publicSignals: postPubSig, proof: postPf } =
                await posterState.genEpochKeyProof({
                    nonce: 0,
                    epoch: 0,
                    data: BigInt(0),
                    revealNonce: false,
                    attesterId,
                })
            posterEpochKey = postPubSig[0]
            posterEpoch = await posterState.sync.loadCurrentEpoch()

            await app.post(postPubSig, postPf, content)
            posterState.stop()
        } catch (err) {
            console.error(err)
        }
    })

    /**
     * 1. succeed to punish poster
     * 2. revert with used proof
     * 3. succeed with punish reporter
     * 4. revert with used proof
     * 4. revert with invalid proof
     * 5. revert with wrong epoch
     * 6. revert with invalid attesterId
     */
    it('should succeed with valid input to punish poster', async () => {
        const posterState = await genUserState(poster.id, app)
        const identitySecret = poster.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = await posterState.sync.loadCurrentEpoch()
        expect(currentEpoch).to.be.equal(10)

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: posterEpochKey,
                identitySecret,
                reportedEpoch: posterEpoch,
                currentEpoch,
                currentNonce,
                chainId,
                attesterId,
            })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNonNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const tx = await app.claimReportNegRep(
            usedPublicSig,
            usedProof,
            identifier,
            posterPunishment
        )
        await expect(tx)
            .to.emit(app, 'ClaimNegRep')
            .withArgs(publicSignals[0], currentEpoch)

        posterState.stop()
    })

    it('should revert with non owner', async () => {
        const notOwner = await ethers.getSigners().then((signers) => signers[1])
        await expect(
            app
                .connect(notOwner)
                .claimReportPosRep(
                    usedPublicSig,
                    usedProof,
                    identifier,
                    posterPunishment
                )
        ).to.be.reverted
    })

    it('should revert with used proof from poster', async () => {
        await expect(
            app.claimReportPosRep(
                usedPublicSig,
                usedProof,
                identifier,
                posterPunishment
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
                attesterId,
            })
        reporterEpochKey = reporterPubSig[0]
        reporterEpoch = await reporterState.sync.loadCurrentEpoch()

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])
    })

    it('should succeed with valid input to punish reporter', async () => {
        const reporterState = await genUserState(reporter.id, app)
        const identitySecret = reporter.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = await reporterState.sync.loadCurrentEpoch()
        expect(currentEpoch).to.be.equal(15)

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
            circuit,
            reportNonNullifierCircuitInputs
        )

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const tx = await app.claimReportNegRep(
            usedPublicSig,
            usedProof,
            identifier,
            reporterPunishment
        )
        await expect(tx)
            .to.emit(app, 'ClaimNegRep')
            .withArgs(publicSignals[0], currentEpoch)

        reporterState.stop()
    })

    it('should revert with used proof from reporter', async () => {
        await expect(
            app.claimReportPosRep(
                usedPublicSig,
                usedProof,
                identifier,
                posterPunishment
            )
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    it('should revert with wrong proof', async () => {
        const posterState = await genUserState(poster.id, app)
        const identitySecret = poster.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = await posterState.sync.loadCurrentEpoch()
        expect(currentEpoch).to.be.equal(20)

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: posterEpochKey,
                identitySecret,
                reportedEpoch: posterEpoch,
                currentEpoch,
                currentNonce,
                chainId,
                attesterId,
            })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNonNullifierCircuitInputs
        )
        const flattenedProof = flattenProof(proof)
        flattenedProof[0] = BigInt(0)

        await expect(
            app.claimReportNegRep(
                publicSignals,
                flattenedProof,
                identifier,
                posterPunishment
            )
        ).to.be.reverted

        posterState.stop()
    })

    it('should revert with wrong epoch', async () => {
        const posterState = await genUserState(poster.id, app)
        const identitySecret = poster.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = BigInt(44444) // correct epoch = 20

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: posterEpochKey,
                identitySecret,
                reportedEpoch: posterEpoch,
                currentEpoch,
                currentNonce,
                chainId,
                attesterId,
            })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNonNullifierCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimReportNegRep(
                publicSignals,
                flattenedProof,
                identifier,
                posterPunishment
            )
        ).to.be.revertedWithCustomError(app, 'InvalidEpoch')

        posterState.stop()
    })

    it('should revert with wrong attester', async () => {
        const posterState = await genUserState(poster.id, app)
        const identitySecret = poster.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = await posterState.sync.loadCurrentEpoch()
        expect(currentEpoch).to.be.equal(30)
        const wrongAttester = BigInt(444444)

        const reportNonNullifierCircuitInputs =
            genReportNonNullifierCircuitInput({
                reportedEpochKey: posterEpochKey,
                identitySecret,
                reportedEpoch: posterEpoch,
                currentEpoch,
                currentNonce,
                chainId,
                attesterId: wrongAttester,
            })

        // this will not generate a proof since the attesterId would change the epochkey
        try {
            await genProofAndVerify(circuit, reportNonNullifierCircuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template ReportNonNullifierProof_79 line: 42\n'
            )
        }

        posterState.stop()
    })
})
