import * as utils from '@unirep/utils'
import { expect } from 'chai'
import {
    createRandomUserIdentity,
    decodeEpochKeyControl,
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
    it('should generate a negative reputation proof with type 0 and output with correct epochKey', async () => {
        const identitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const type = 0

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

        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
            type,
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

    it('should generate a negative reputation proof with type 1 and output with correct epochKey', async () => {
        const identitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const type = 1

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

        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
            type,
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

    it('should revert with invalid type', async () => {
        const identitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const type = 2

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

        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
            type,
        })

        try {
            const { isValid } = await genProofAndVerify(circuit, circuitInputs)
            expect(isValid).to.be.false
        } catch (error) {
            console.log('Expected error occurred:\n\n', error)
        }
    })

    it('should revert with invalid identitySecret', async () => {
        const correctidentitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const type = 0

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

        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
            type,
        })
        try {
            const { isValid } = await genProofAndVerify(circuit, circuitInputs)
            expect(isValid).to.be.false
        } catch (error) {
            console.log('Expected error occurred:\n\n', error)
        }
    })

    it('should revert with invalid reportedEpoch', async () => {
        const identitySecret = user.id.secret
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const type = 0

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
        const circuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            identitySecret,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
            type,
        })

        try {
            const { isValid } = await genProofAndVerify(circuit, circuitInputs)
            expect(isValid).to.be.false
        } catch (error) {
            console.log('Expected error occurred:\n\n', error)
        }
    })
})
