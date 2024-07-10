// @ts-ignore
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createRandomUserIdentity,
    flattenProof,
    genNullifier,
    genProofAndVerify,
    genReportNullifierCircuitInput,
    genUserState,
    genVHelperIdentifier,
} from './utils'

describe('Claim Report Positive Reputation Test', function () {
    this.timeout(1000000)
    let unirep: Unirep
    let app: UnirepApp
    let chainId: number
    let user: IdentityObject

    let snapshot: any
    const epochLength = 300
    const posReputation = 3
    const circuit = 'reportNullifierProof'
    const identifier = genVHelperIdentifier(
        'reportNullifierProofVerifierHelper'
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

            user = createRandomUserIdentity()

            chainId = await unirep.chainid()

            const userState = await genUserState(user.id, app)
            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            await app.userSignUp(publicSignals, proof, user.hashUserId, false)
            await app
                .userRegistry(user.hashUserId)
                .then((res) => expect(res).to.be.true)
            console.log('user register success...')
            userState.stop()
        } catch (err) {
            console.error(err)
        }
    })

    it('should succeed with valid inputs (correct epochKey, epoch, etc)', async () => {
        const reportId = 0
        const currentNonce = 0
        const hashUserId = user.hashUserId

        const attesterId = BigInt(app.address)
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

        usedPublicSig = publicSignals
        usedProof = flattenProof(proof)

        const tx = await app.claimReportPosRep(
            usedPublicSig,
            usedProof,
            identifier,
            posReputation
        )
        await expect(tx)
            .to.emit(app, 'ClaimReportPosRep')
            .withArgs(publicSignals[0], currentEpoch)

        userState.stop()
    })

    it('should revert with used epochKeyProof ProofHasUsed', async () => {
        await expect(
            app.claimReportPosRep(
                usedPublicSig,
                usedProof,
                identifier,
                posReputation
            )
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    it('should revert with wrong epochKeyProof', async () => {
        const reportId = 1
        const currentNonce = 0
        const hashUserId = user.hashUserId

        const attesterId = BigInt(app.address)
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

        const flattenedProof = flattenProof(proof)
        flattenedProof[0] = BigInt(0)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                identifier,
                posReputation
            )
        ).to.be.reverted

        userState.stop()
    })

    it('should revert with wrong epoch', async () => {
        const reportId = 1
        const currentNonce = 0
        const hashUserId = user.hashUserId

        const attesterId = BigInt(app.address)
        const userState = await genUserState(user.id, app)
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
            circuit,
            reportNullifierCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                identifier,
                posReputation
            )
        ).to.be.revertedWithCustomError(app, 'InvalidEpoch')

        userState.stop()
    })

    it('should revert with wrong attester InvalidAttester', async () => {
        const reportId = 1
        const currentNonce = 0
        const hashUserId = user.hashUserId

        const wrongAttester = BigInt(44444)
        const userState = await genUserState(user.id, app)
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

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimReportPosRep(
                publicSignals,
                flattenedProof,
                identifier,
                posReputation
            )
        ).to.be.reverted

        userState.stop()
    })
})
