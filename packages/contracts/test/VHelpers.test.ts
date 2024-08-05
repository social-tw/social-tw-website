//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { genEpochKey } from '@unirep/utils'
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

describe('Verifier Helper Manager Test', function () {
    let unirep: Unirep
    let app: UnirepApp
    let reportNonNullifierVHelper: any
    let reportNullifierVHelper: any
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
        reportNonNullifierVHelper = contracts.reportNonNullifierVHelper
        reportNullifierVHelper = contracts.reportNullifierVHelper
        user = createRandomUserIdentity()
    })

    describe('report non nullifier proof verification tests', async function () {
        it('should verify with valid proof and public signal', async function () {
            chainId = 31337
            const identitySecret = user.id.secret
            const currentEpoch = 20
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const circuit = 'reportNonNullifierProof'

            // generating report epoch key
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

            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNonNullifierCircuitInputs
            )
            expect(isValid).to.be.equal(true)

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)

            const signal = await reportNonNullifierVHelper.verifyAndCheck(
                publicSignals,
                flattenedProof
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
            const currentNonce = 1
            const attesterId = BigInt(app.address)
            const circuit = 'reportNonNullifierProof'

            // generating report epoch key
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

            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNonNullifierCircuitInputs
            )
            expect(isValid).to.be.equal(true)

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)
            const invalidProof = flattenedProof
                .slice(0, flattenedProof.length - 1)
                .concat(BigInt(0).toString())
            await expect(
                reportNonNullifierVHelper.verifyAndCheck(
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

            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNullifierCircuitInputs
            )
            expect(isValid).to.be.equal(true)

            const flattenedProof = flattenProof(proof)
            const signal = await reportNullifierVHelper.verifyAndCheck(
                publicSignals,
                flattenedProof
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

            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNullifierCircuitInputs
            )
            expect(isValid).to.be.equal(true)

            const flattenedProof = flattenProof(proof)

            const invalidProof = flattenedProof
                .slice(0, flattenedProof.length - 1)
                .concat(BigInt(0).toString())

            await expect(
                reportNullifierVHelper.verifyAndCheck(
                    publicSignals,
                    invalidProof
                )
            ).to.be.reverted
        })
    })
})
