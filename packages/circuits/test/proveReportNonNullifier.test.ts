import * as utils from '@unirep/utils'
import { expect } from 'chai'
import {
    createRandomUserIdentity,
    decodeEpochKeyControl,
    genProofAndVerify,
    genReportNonNullifierCircuitInput,
} from './utils'
import { ProofGenerationError } from './error'

const circuit = 'reportNonNullifierProof'

describe('Prove report non nullifier in Unirep Social-TW', function () {
    this.timeout(300000)
    /**
     * 1. should generate a non nullifier proof and outputs epk and control data
     * 2. should revert with invalid identitySecret
     * 3. should revert with invalid reported_epoch
     * 4. should revert with invalid reported_epoch_key
     */

    const chainId = 31337
    const user = createRandomUserIdentity()
    it('should generate a non nullifier proof and output with correct epochKey and data', async () => {
        const identitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)

        // generate report epoch key
        const reportedEpoch = 5
        const reportedNonce = 2
        const reportedEpochKey = utils.genEpochKey(
            BigInt(identitySecret),
            attesterId,
            reportedEpoch,
            reportedNonce,
            chainId
        )

        const circuitInputs = genReportNonNullifierCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
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
                    BigInt(identitySecret),
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

    it('should revert with invalid identitySecret', async () => {
        const correctidentitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)

        // generate report epoch key
        const reportedEpoch = 5
        const reportedNonce = 2
        const reportedEpochKey = utils.genEpochKey(
            BigInt(correctidentitySecret),
            attesterId,
            reportedEpoch,
            reportedNonce,
            chainId
        )
        const identitySecret = BigInt(123)

        const circuitInputs = genReportNonNullifierCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
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
                'Error: Assert Failed. Error in template ReportNonNullifierProof_79 line: 42\n'
            )
        }
    })

    it('should revert with invalid reportedEpoch', async () => {
        const identitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)

        // generate report epoch key
        const correctReportedEpoch = 5
        const reportedNonce = 2
        const reportedEpochKey = utils.genEpochKey(
            BigInt(identitySecret),
            attesterId,
            correctReportedEpoch,
            reportedNonce,
            chainId
        )
        const reportedEpoch = 12
        const circuitInputs = genReportNonNullifierCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
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
                'Error: Assert Failed. Error in template ReportNonNullifierProof_79 line: 42\n'
            )
        }
    })

    it('should revert with invalid reported_epoch_key', async () => {
        const identitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)

        const reportedEpochKey = BigInt(123)
        const reportedEpoch = 5

        const circuitInputs = genReportNonNullifierCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
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
                'Error: Assert Failed. Error in template ReportNonNullifierProof_79 line: 42\n'
            )
        }
    })
})
