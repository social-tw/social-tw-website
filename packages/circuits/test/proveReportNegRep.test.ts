import * as utils from '@unirep/utils'
import { expect } from 'chai'
import {
    createRandomUserIdentity,
    genProofAndVerify,
    genReportNegRepCircuitInput,
} from './utils'

const circuit = 'reportNegRepProof'

describe('Prove report negative reputation in Unirep Social-TW', function () {
    this.timeout(300000)
    /**
     * 1. should generate a negative reputation proof and outputs an epoch key
     * 2. should revert with invalid userId
     * 3. should revert with invalid reported_epoch
     */

    const chainId = 31337
    const user = createRandomUserIdentity()
    it('should generate a negative reputation proof and output with correct epochKey', async () => {
        const hashUserId = user.hashUserId
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)

        // generate report epoch key
        const reportedEpoch = 5
        const reportedNonce = 2
        const reportedEpochKey = utils.genEpochKey(
            BigInt(hashUserId),
            attesterId,
            reportedEpoch,
            reportedNonce,
            chainId
        )

        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            hashUserId,
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
                    BigInt(hashUserId),
                    attesterId,
                    currentEpoch,
                    currentNonce,
                    chainId
                )
                .toString()
        )
    })

    it('should revert with invalid hashUserId', async () => {
        const correctHashUserId = user.hashUserId
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)

        // generate report epoch key
        const reportedEpoch = 5
        const reportedNonce = 2
        const reportedEpochKey = utils.genEpochKey(
            BigInt(correctHashUserId),
            attesterId,
            reportedEpoch,
            reportedNonce,
            chainId
        )
        const hashUserId = BigInt(123)

        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            hashUserId,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })
        try {
            const { isValid } = await genProofAndVerify(circuit, circuitInputs)
            expect(isValid).to.be.false
        } catch (error) {
            console.log('Expected error occurred:\n\n', error)
        }
    })

    it('should revert with invalid reportedEpoch', async () => {
        const hashUserId = user.hashUserId
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)

        // generate report epoch key
        const correctReportedEpoch = 5
        const reportedNonce = 2
        const reportedEpochKey = utils.genEpochKey(
            BigInt(hashUserId),
            attesterId,
            correctReportedEpoch,
            reportedNonce,
            chainId
        )
        const reportedEpoch = 12
        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            hashUserId,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        try {
            const { isValid } = await genProofAndVerify(circuit, circuitInputs)
            expect(isValid).to.be.false
        } catch (error) {
            console.log('Expected error occurred:\n\n', error)
        }
    })
})
