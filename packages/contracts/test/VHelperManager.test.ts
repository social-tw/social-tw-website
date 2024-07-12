import { expect } from 'chai'
//@ts-ignore
import { genEpochKey } from '@unirep/utils'
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
    genReportNegRepCircuitInput,
    genReportNullifierCircuitInput,
    genVHelperIdentifier,
} from './utils'

describe('Verifier Helper Manager Test', function () {
    let unirep: Unirep
    let app: UnirepApp
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
        user = createRandomUserIdentity()
    })

    describe('report negative reputation proof verification tests', async function () {
        it('should verify with valid proof and public signal', async function () {
            chainId = 31337
            const identitySecret = user.id.secret
            const currentEpoch = 20
            const currentNonce = 2
            const attesterId = BigInt(app.address)
            const circuit = 'reportNegRepProof'
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

            // generating proof for report negative reputation proof
            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNegRepCircuitInputs
            )

            expect(isValid).to.be.equal(true)

            const currentEpochKey = publicSignals[0]
            // generate identifier
            const identifier = genVHelperIdentifier(
                'reportNegRepProofVerifierHelper'
            )

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)

            const signal = await app.verifyWithIdentifier(
                publicSignals,
                flattenedProof,
                identifier
            )
            expect(signal.epochKey.toString()).to.be.equal(
                genEpochKey(
                    identitySecret,
                    attesterId,
                    currentEpoch,
                    currentNonce,
                    chainId
                ).toString()
            )
            expect(signal.epoch.toString()).to.be.equal(currentEpoch.toString())
            expect(signal.attesterId.toString()).to.be.equal(
                attesterId.toString()
            )
            expect(signal.chainId.toString()).to.be.equal(chainId.toString())

            // we don't reveal the nonce, so this is equal to BigInt(0)
            expect(signal.nonce.toString()).to.be.equal('0')
        })
        it('should revert with invalid proof', async function () {
            chainId = 31337
            const identitySecret = user.id.secret
            const currentEpoch = 20
            const currentNonce = 2
            const attesterId = BigInt(app.address)
            const circuit = 'reportNegRepProof'
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

            // generating proof for report negative reputation proof
            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNegRepCircuitInputs
            )

            expect(isValid).to.be.equal(true)

            // generate identifier
            const identifier = genVHelperIdentifier(
                'reportNegRepProofVerifierHelper'
            )

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)
            const invalidProof = flattenedProof
                .slice(0, flattenedProof.length - 1)
                .concat(BigInt(0))
            await expect(
                app.verifyWithIdentifier(
                    publicSignals,
                    invalidProof,
                    identifier
                )
            ).to.be.reverted
        })
    })

    describe('report nullifier proof verification tests', async function () {
        it('should verify with valid proof and public signal', async function () {
            const circuit = 'reportNullifierProof'
            chainId = 31337
            const hashUserId = user.hashUserId
            const reportId = 0

            const currentEpoch = 20
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const reportNullifier = genNullifier(hashUserId, reportId)

            const reportNullifierCircuitInputs = genReportNullifierCircuitInput(
                {
                    reportNullifier,
                    hashUserId,
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

            // generate identifier
            const identifier = genVHelperIdentifier(
                'reportNullifierProofVerifierHelper'
            )

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)
            const signal = await app.verifyWithIdentifier(
                publicSignals,
                flattenedProof,
                identifier
            )
            expect(signal.epochKey.toString()).to.be.equal(
                genEpochKey(
                    BigInt(hashUserId),
                    attesterId,
                    currentEpoch,
                    currentNonce,
                    chainId
                ).toString()
            )
            expect(signal.epoch.toString()).to.be.equal(currentEpoch.toString())
            expect(signal.attesterId.toString()).to.be.equal(
                attesterId.toString()
            )
            expect(signal.chainId.toString()).to.be.equal(chainId.toString())

            // we don't reveal the nonce, so this is equal to BigInt(0)
            expect(signal.nonce.toString()).to.be.equal('0')
        })

        it('should revert with invalid proof', async function () {
            const circuit = 'reportNullifierProof'
            chainId = 31337
            const hashUserId = user.hashUserId
            const reportId = 0

            const currentEpoch = 20
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const reportNullifier = genNullifier(hashUserId, reportId)

            const reportNullifierCircuitInputs = genReportNullifierCircuitInput(
                {
                    reportNullifier,
                    hashUserId,
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

            // generate identifier
            const identifier = genVHelperIdentifier(
                'reportNullifierProofVerifierHelper'
            )

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)
            const invalidProof = flattenedProof
                .slice(0, flattenedProof.length - 1)
                .concat(BigInt(0))
            await expect(
                app.verifyWithIdentifier(
                    publicSignals,
                    invalidProof,
                    identifier
                )
            ).to.be.reverted
        })
    })
})
