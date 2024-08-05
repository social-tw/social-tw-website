import * as utils from '@unirep/utils'
import { expect } from 'chai'
import { ProofGenerationError } from './error'
import {
    createRandomUserIdentity,
    decodeEpochKeyControl,
    genNullifier,
    genProofAndVerify,
    genReportNullifierCircuitInput,
} from './utils'

const circuit = 'reportNullifierProof'

describe('Prove report nullifier in Unirep Social-TW', function () {
    this.timeout(300000)
    /**
     * 1. should generate a nullifierProof and outputs an epoch key
     * 2. should revert with invalid userId
     * 3. should revert with invalid reportId
     */

    const chainId = 31337
    const user = createRandomUserIdentity()
    it('should generate a report nullifier proof and output with correct epochKey', async () => {
        const hashUserId = user.hashUserId
        const reportId = 0
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const reportNullifier = genNullifier(hashUserId, reportId)
        const circuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })
        const { isValid, publicSignals } = await genProofAndVerify(
            circuit,
            circuitInputs
        )
        expect(isValid).to.be.true
        const epochKey = publicSignals[0]
        expect(epochKey.toString()).to.be.equal(
            utils
                .genEpochKey(
                    BigInt(hashUserId),
                    attesterId,
                    currentEpoch,
                    currentNonce,
                    chainId
                )
                .toString()
        )
        // decode other data
        const controlData = decodeEpochKeyControl(BigInt(publicSignals[1]))
        expect(controlData.epoch.toString()).to.be.equal(
            currentEpoch.toString()
        )
        expect(controlData.attesterId.toString()).to.be.equal(
            attesterId.toString()
        )
        expect(controlData.chainId.toString()).to.be.equal(chainId.toString())

        // we don't reveal the nonce, so this is equal to BigInt(0)
        expect(controlData.nonce.toString()).to.be.equal('0')
    })

    it('should revert with invalid hashUserId', async () => {
        const reportId = 0
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const reportNullifier = genNullifier(user.hashUserId, reportId)
        const hashUserId = BigInt(123)
        const circuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template ReportNullifierProof_79 line: 24\n'
            )
        }
    })

    it('should revert with invalid reportId', async () => {
        const hashUserId = user.hashUserId
        let reportId = 1
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const reportNullifier = genNullifier(user.hashUserId, reportId)
        reportId = 2
        const circuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })
        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template ReportNullifierProof_79 line: 24\n'
            )
        }
    })
})
