//@ts-ignore
import { genEpochKey } from '@unirep/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { describe } from 'node:test'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createRandomUserIdentity,
    flattenProof,
    genNullifier,
    genProofAndVerify,
    genReportNonNullifierCircuitInput,
    genReportNullifierCircuitInput,
} from './utils'

describe('Verifier Test', function () {
    let unirep: Unirep
    let app: UnirepApp
    let reportNonNullifierVerifier
    let reportNullifierVerifier
    let chainId: number
    let user: IdentityObject

    // snapshot of evm environment
    let snapshot: any
    // epoch length
    const epochLength = 300

    // record and revert of evm enviroment
    {
        before(async function () {
            snapshot = await ethers.provider.send('evm_snapshot', [])
        })
        after(async function () {
            await ethers.provider.send('evm_revert', [snapshot])
        })
    }

    before(async function () {
        // deployment
        const [deployer] = await ethers.getSigners()
        const contracts = await deployApp(deployer, epochLength)
        unirep = contracts.unirep
        app = contracts.app
        reportNonNullifierVerifier = contracts.reportNonNullifierProofVerifier
        reportNullifierVerifier = contracts.reportNullifierProofVerifier
        user = createRandomUserIdentity()
    })

    describe('report negative reputation proof verification tests', async function () {
        it('should verify with valid proof and public signal', async function () {
            chainId = 31337
            const identitySecret = user.id.secret
            const currentEpoch = 20
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const circuit = 'reportNonNullifierProof'
            // generate report epoch key
            const reportedEpoch = 5
            const reportedNonce = 2
            const reportedEpochKey = genEpochKey(
                identitySecret,
                attesterId,
                reportedEpoch,
                reportedNonce,
                chainId
            )

            const reportNonNullifierCircuitInputs =
                genReportNonNullifierCircuitInput({
                    reportedEpochKey,
                    identitySecret,
                    reportedEpoch,
                    currentEpoch,
                    currentNonce,
                    chainId,
                    attesterId,
                })

            // generating proof for report negative reputation proof
            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNonNullifierCircuitInputs
            )
            expect(isValid).to.be.equal(true)

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)
            const valid = await reportNonNullifierVerifier.verifyProof(
                publicSignals,
                flattenedProof
            )
            expect(valid).to.be.equal(true)
        })
        it('should revert with invalid proof', async function () {
            chainId = 31337
            const identitySecret = user.id.secret
            const currentEpoch = 20
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const circuit = 'reportNonNullifierProof'
            // generate report epoch key
            const reportedEpoch = 5
            const reportedNonce = 2
            const reportedEpochKey = genEpochKey(
                identitySecret,
                attesterId,
                reportedEpoch,
                reportedNonce,
                chainId
            )

            const reportNonNullifierCircuitInputs =
                genReportNonNullifierCircuitInput({
                    reportedEpochKey,
                    identitySecret,
                    reportedEpoch,
                    currentEpoch,
                    currentNonce,
                    chainId,
                    attesterId,
                })

            // generating proof for report negative reputation proof
            const { publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNonNullifierCircuitInputs
            )

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)
            const invalidProof = flattenedProof
                .slice(0, flattenedProof.length - 1)
                .concat(BigInt(0).toString())

            await expect(
                reportNonNullifierVerifier.verifyProof(
                    publicSignals,
                    invalidProof
                )
            ).to.be.reverted
        })
    })

    describe('report nullifier proof verification tests', async function () {
        it('should verify with valid proof and public signal', async function () {
            const circuit = 'reportNullifierProof'
            chainId = 31337
            const identitySecret = user.id.secret
            const reportId = 0

            const currentEpoch = 20
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const reportNullifier = genNullifier(user.id, reportId)

            const reportNullifierCircuitInputs = genReportNullifierCircuitInput(
                {
                    reportNullifier,
                    identitySecret,
                    reportId,
                    currentEpoch,
                    currentNonce,
                    attesterId,
                    chainId,
                }
            )

            // generating proof for report negative reputation proof
            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNullifierCircuitInputs
            )
            expect(isValid).to.be.equal(true)

            const flattenedProof = flattenProof(proof)
            const valid = await reportNullifierVerifier.verifyProof(
                publicSignals,
                flattenedProof
            )
            expect(valid).to.be.equal(true)
        })
        it('should revert with invalid proof', async function () {
            const circuit = 'reportNullifierProof'
            chainId = 31337
            const identitySecret = user.id.secret
            const reportId = 0

            const currentEpoch = 20
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const reportNullifier = genNullifier(user.id, reportId)

            const reportNullifierCircuitInputs = genReportNullifierCircuitInput(
                {
                    reportNullifier,
                    identitySecret,
                    reportId,
                    currentEpoch,
                    currentNonce,
                    attesterId,
                    chainId,
                }
            )

            // generating proof for report nullifier proof
            const { publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNullifierCircuitInputs
            )

            const flattenedProof = flattenProof(proof)
            const invalidProof = flattenedProof
                .slice(0, flattenedProof.length - 1)
                .concat(BigInt(0).toString())

            await expect(
                reportNullifierVerifier.verifyProof(publicSignals, invalidProof)
            ).to.be.reverted
        })
    })
})
