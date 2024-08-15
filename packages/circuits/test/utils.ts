import { Identity } from '@semaphore-protocol/identity'
import { Circuit, CircuitConfig } from '@unirep/circuits'
import * as utils from '@unirep/utils'
import crypto from 'crypto'
import { poseidon1, poseidon2 } from 'poseidon-lite'
import { defaultProver } from '../provers/defaultProver'
import { IdentityObject } from '../src/types'
import { ProofGenerationError } from './error'

export const genProofAndVerify = async (
    circuit: Circuit | string,
    circuitInputs: any
) => {
    const startTime = new Date().getTime()
    let proof: any, publicSignals: any
    try {
        ;({ proof, publicSignals } =
            await defaultProver.genProofAndPublicSignals(
                circuit,
                circuitInputs
            ))
    } catch (error) {
        if (error instanceof Error) {
            throw new ProofGenerationError(error?.message)
        } else {
            throw new Error(`Unknown Error...`)
        }
    }
    const endTime = new Date().getTime()
    console.log(
        `Gen Proof time: ${endTime - startTime} ms (${Math.floor(
            (endTime - startTime) / 1000
        )} s)`
    )
    const isValid = await defaultProver.verifyProof(
        circuit,
        publicSignals,
        proof
    )
    return { isValid, proof, publicSignals }
}

export const createRandomUserIdentity = (): IdentityObject => {
    const hash = crypto.createHash('sha3-224')
    const hashUserId = `0x${hash
        .update(new Identity().toString())
        .digest('hex')}` as string
    const id = new Identity(hashUserId) as Identity
    return { hashUserId, id }
}

export const genNullifier = (identity: Identity, reportId: number | bigint) => {
    return poseidon2([identity.secret, reportId])
}

export const genReportNonNullifierCircuitInput = (config: {
    reportedEpochKey: any
    identitySecret: string | bigint
    reportedEpoch: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
}) => {
    const {
        reportedEpochKey,
        identitySecret,
        reportedEpoch,
        currentEpoch,
        currentNonce,
        chainId,
        attesterId,
    } = Object.assign(config)

    const circuitInputs = {
        reported_epoch_key: reportedEpochKey,
        identity_secret: identitySecret,
        reported_epoch: reportedEpoch,
        current_epoch: currentEpoch,
        current_nonce: currentNonce,
        chain_id: chainId,
        attester_id: attesterId,
    }
    return utils.stringifyBigInts(circuitInputs)
}

export const genReportNullifierCircuitInput = (config: {
    reportNullifier: any
    identitySecret: string | bigint
    reportId: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
}) => {
    const {
        reportNullifier,
        identitySecret,
        reportId,
        currentEpoch,
        currentNonce,
        chainId,
        attesterId,
    } = Object.assign(config)

    const circuitInputs = {
        report_nullifier: reportNullifier,
        identity_secret: identitySecret,
        report_id: reportId,
        current_epoch: currentEpoch,
        current_nonce: currentNonce,
        chain_id: chainId,
        attester_id: attesterId,
    }
    return utils.stringifyBigInts(circuitInputs)
}

export const genReportIdentityCircuitInput = (config: {
    reportNullifier: any
    identitySecret: string | bigint
    reportId: number | bigint
    data: string[] | bigint[]
    attesterId: string | bigint
    epoch: number | bigint
    chainId: number | bigint
    stateTreeIndices: number[] | bigint[]
    stateTreeElements: number[] | bigint[]
    stateTreeRoot: number | bigint
}) => {
    const {
        reportNullifier,
        identitySecret,
        reportId,
        data,
        attesterId,
        epoch,
        chainId,
        stateTreeIndices,
        stateTreeElements,
        stateTreeRoot,
    } = Object.assign(config)

    const circuitInputs = {
        report_nullifier: reportNullifier,
        identity_secret: identitySecret,
        report_id: reportId,
        data,
        attester_id: attesterId,
        from_epoch: epoch,
        chain_id: chainId,
        state_tree_indices: stateTreeIndices,
        state_tree_elements: stateTreeElements,
        state_tree_root: stateTreeRoot,
    }
    return utils.stringifyBigInts(circuitInputs)
}

export const randomData = () => [
    ...Array(CircuitConfig.default.SUM_FIELD_COUNT)
        .fill(0)
        .map(() => poseidon1([Math.floor(Math.random() * 199191919)])),
    ...Array(
        CircuitConfig.default.FIELD_COUNT -
            CircuitConfig.default.SUM_FIELD_COUNT
    )
        .fill(0)
        .map(
            () =>
                poseidon1([Math.floor(Math.random() * 199191919)]) %
                BigInt(2) ** CircuitConfig.default.MAX_SAFE_BITS
        ),
]
