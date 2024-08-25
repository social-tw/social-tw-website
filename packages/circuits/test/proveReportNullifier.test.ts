import * as utils from '@unirep/utils'
import { expect } from 'chai'
import { ReportNullifierProof } from '../src'
import { UnirepSocialCircuit } from '../src/types'
import { ProofGenerationError } from './error'
import {
    createRandomUserIdentity,
    genNullifier,
    genProofAndVerify,
    genReportNullifierCircuitInput,
} from './utils'

const circuit = UnirepSocialCircuit.reportNullifierProof

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
        const identitySecret = user.id.secret
        const reportId = 0
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const reportNullifier = genNullifier(user.id, reportId)
        const circuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            identitySecret,
            reportId,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })
        const { isValid, proof, publicSignals } = await genProofAndVerify(
            circuit,
            circuitInputs
        )

        const reportNullifierProof = new ReportNullifierProof(
            publicSignals,
            proof
        )

        expect(isValid).to.be.true
        // decode other data
        expect(reportNullifierProof.epoch.toString()).to.be.equal(
            currentEpoch.toString()
        )
        expect(reportNullifierProof.attesterId.toString()).to.be.equal(
            attesterId.toString()
        )
        expect(reportNullifierProof.chainId.toString()).to.be.equal(
            chainId.toString()
        )

        // we don't reveal the nonce, so this is equal to BigInt(0)
        expect(reportNullifierProof.nonce).to.be.equal(BigInt(0))

        expect(reportNullifierProof.currentEpochKey).to.be.equal(
            utils.genEpochKey(
                BigInt(identitySecret),
                attesterId,
                currentEpoch,
                currentNonce,
                chainId
            )
        )
        expect(reportNullifierProof.reportNullifier).to.be.equal(
            reportNullifier
        )
    })

    it('should revert with invalid identitySecret', async () => {
        const reportId = 0
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const reportNullifier = genNullifier(user.id, reportId)
        const identitySecret = BigInt(123)
        const circuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            identitySecret,
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
                'Error: Assert Failed. Error in template ReportNullifierProof_79 line: 22\n'
            )
        }
    })

    it('should revert with invalid reportId', async () => {
        const identitySecret = user.id.secret
        let reportId = 1
        const currentEpoch = 20
        const currentNonce = 1
        const attesterId = BigInt(219090124810)
        const reportNullifier = genNullifier(user.id, reportId)
        reportId = 2
        const circuitInputs = genReportNullifierCircuitInput({
            reportNullifier,
            identitySecret,
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
                'Error: Assert Failed. Error in template ReportNullifierProof_79 line: 22\n'
            )
        }
    })
})
