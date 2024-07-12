import { expect } from 'chai'
// @ts-ignore
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createMultipleUserIdentity,
    flattenProof,
    genProofAndVerify,
    genReportNegRepCircuitInput,
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
    let reportedEpoch: number
    let reportedEpochKey: bigint

    let snapshot: any
    const epochLength = 300
    const posterPunishment = 5
    const reporterPunishment = 1
    const circuit = 'reportNegRepProof'
    const identifier = genVHelperIdentifier('reportNegRepProofVerifierHelper')
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
            reportedEpochKey = postPubSig[0]
            reportedEpoch = await posterState.sync.loadCurrentEpoch()

            await app.post(postPubSig, postPf, content)
            posterState.stop()
        } catch (err) {
            console.error(err)
        }
    })

    /**
     * 1. succeed with type 0 (punishing poster)
     * 2. revert with used type-0 proof
     * 3. succeed with type 1 (punishing reporter)
     * 4. revert with used type-1 proof
     * 4. revert with invalid proof
     * 5. revert with wrong epoch
     * 6. revert with invalid attesterId
     */
    it('should succeed with valid input with type 0 (punishing poster)', async () => {
        const posterState = await genUserState(poster.id, app)
        const identitySecret = poster.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = await posterState.sync.loadCurrentEpoch()
        expect(currentEpoch).to.be.equal(5)

        const type = 0
        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            chainId,
            attesterId,
            type,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNegRepCircuitInputs
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
    it('should revert with used proof (for poster punishment)', async () => {
        await expect(
            app.claimReportPosRep(
                usedPublicSig,
                usedProof,
                identifier,
                posterPunishment
            )
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    it('should succeed with valid input with type 1 (punishing reporter)', async () => {
        const reporterState = await genUserState(reporter.id, app)
        const identitySecret = reporter.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = await reporterState.sync.loadCurrentEpoch()
        expect(currentEpoch).to.be.equal(10)

        const type = 1
        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            chainId,
            attesterId,
            type,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNegRepCircuitInputs
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

    it('should revert with used proof (for reporter punishment)', async () => {
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
        expect(currentEpoch).to.be.equal(15)

        const type = 0
        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            chainId,
            attesterId,
            type,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNegRepCircuitInputs
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

        const type = 0
        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            chainId,
            attesterId,
            type,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            reportNegRepCircuitInputs
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

    it('should revert with wrong attester InvalidAttester', async () => {
        const posterState = await genUserState(poster.id, app)
        const identitySecret = poster.id.secret

        // elapsing 5 epoch
        await ethers.provider.send('evm_increaseTime', [epochLength * 5])
        await ethers.provider.send('evm_mine', [])

        const currentNonce = 0
        const currentEpoch = await posterState.sync.loadCurrentEpoch()
        expect(currentEpoch).to.be.equal(25)
        const wrongAttester = BigInt(444444)

        const type = 0
        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            chainId,
            attesterId: wrongAttester,
            type,
        })

        // this will not generate a proof since the attesterId would change the epochkey
        try {
            await genProofAndVerify(circuit, reportNegRepCircuitInputs)
        } catch (e) {
            console.log(e)
        }

        posterState.stop()
    })
})
