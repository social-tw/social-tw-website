import * as utils from '@unirep/utils'
import { expect } from 'chai'
import {
    createRandomUserIdentity,
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
        const circuitInputs = genCircuitInput({
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
            const { isValid } = await genProofAndVerify(circuit, circuitInputs)
            expect(isValid).to.be.false
        } catch (error) {
            console.log('Expected error occurred:\n\n', error)
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
        const circuitInputs = genCircuitInput({
            reportNullifier,
            hashUserId,
            reportId,
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
