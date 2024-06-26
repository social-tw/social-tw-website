import { expect } from 'chai'
import * as utils from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import { IdentityObject } from './types'
import { Circuit } from '@unirep/circuits'
import { defaultProver } from '../provers/defaultProver'
import crypto from 'crypto'
const circuit = 'reportNegRepProof'

const genCircuitInput = (config: {
    reportedEpochKey: any
    hashUserId: string | bigint
    reportedEpoch: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
}) => {
    const {
        reportedEpochKey,
        hashUserId,
        reportedEpoch,
        currentEpoch,
        currentNonce,
        chainId,
        attesterId,
    } = Object.assign(config)

    const circuitInputs = {
        reported_epoch_key: reportedEpochKey,
        hash_user_id: hashUserId,
        reported_epoch: reportedEpoch,
        current_epoch: currentEpoch,
        current_nonce: currentNonce,
        chain_id: chainId,
        attester_id: attesterId,
    }
    return utils.stringifyBigInts(circuitInputs)
}

const genProofAndVerify = async (
    circuit: Circuit | string,
    circuitInputs: any,
) => {
    const startTime = new Date().getTime()
    const { proof, publicSignals } =
        await defaultProver.genProofAndPublicSignals(circuit, circuitInputs)
    const endTime = new Date().getTime()
    console.log(
        `Gen Proof time: ${endTime - startTime} ms (${Math.floor(
            (endTime - startTime) / 1000,
        )} s)`,
    )
    const isValid = await defaultProver.verifyProof(
        circuit,
        publicSignals,
        proof,
    )
    return { isValid, proof, publicSignals }
}

const createRandomUserIdentity = (): IdentityObject => {
    const hash = crypto.createHash('sha3-224')
    const hashUserId = `0x${hash
        .update(new Identity().toString())
        .digest('hex')}` as string
    const id = new Identity(hashUserId) as Identity
    return { hashUserId, id }
}

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
            chainId,
        )

        const circuitInputs = genCircuitInput({
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
            circuitInputs,
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
                    chainId,
                )
                .toString(),
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
            chainId,
        )
        const hashUserId = BigInt(123)

        const circuitInputs = genCircuitInput({
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
            chainId,
        )
        const reportedEpoch = 12
        const circuitInputs = genCircuitInput({
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
