import { Identity } from '@semaphore-protocol/identity'
import { Circuit } from '@unirep/circuits'
import * as utils from '@unirep/utils'
import {
    ATTESTER_ID_BITS,
    CHAIN_ID_BITS,
    EPOCH_BITS,
    NONCE_BITS,
    REVEAL_NONCE_BITS,
} from '@unirep/utils'
import crypto from 'crypto'
import { poseidon2 } from 'poseidon-lite'
import { defaultProver } from '../provers/defaultProver'
import { EpochKeyControl, IdentityObject } from './types'

export const genProofAndVerify = async (
    circuit: Circuit | string,
    circuitInputs: any
) => {
    const startTime = new Date().getTime()
    const { proof, publicSignals } =
        await defaultProver.genProofAndPublicSignals(circuit, circuitInputs)
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

export const genNullifier = (hashUserId: string, reportId: number | bigint) => {
    return poseidon2([hashUserId, reportId])
}

export const genReportNegRepCircuitInput = (config: {
    reportedEpochKey: any
    hashUserId: string | bigint
    reportedEpoch: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
    type: number | bigint
}) => {
    const {
        reportedEpochKey,
        hashUserId,
        reportedEpoch,
        currentEpoch,
        currentNonce,
        chainId,
        attesterId,
        type,
    } = Object.assign(config)

    const circuitInputs = {
        reported_epoch_key: reportedEpochKey,
        hash_user_id: hashUserId,
        reported_epoch: reportedEpoch,
        current_epoch: currentEpoch,
        current_nonce: currentNonce,
        chain_id: chainId,
        attester_id: attesterId,
        type,
    }
    return utils.stringifyBigInts(circuitInputs)
}

export const genReportNullifierCircuitInput = (config: {
    reportNullifier: any
    hashUserId: string | bigint
    reportId: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
}) => {
    const {
        reportNullifier,
        hashUserId,
        reportId,
        currentEpoch,
        currentNonce,
        chainId,
        attesterId,
    } = Object.assign(config)

    const circuitInputs = {
        report_nullifier: reportNullifier,
        hash_user_id: hashUserId,
        report_id: reportId,
        current_epoch: currentEpoch,
        current_nonce: currentNonce,
        chain_id: chainId,
        attester_id: attesterId,
    }
    return utils.stringifyBigInts(circuitInputs)
}

export const shiftBits = (
    data: bigint,
    shiftBits: bigint,
    variableBits: bigint
): bigint => {
    return (data >> shiftBits) & ((BigInt(1) << variableBits) - BigInt(1))
}

export const decodeEpochKeyControl = (control: bigint): EpochKeyControl => {
    let accBits = BigInt(0)
    const nonce = shiftBits(control, accBits, NONCE_BITS)
    accBits += NONCE_BITS
    const epoch = shiftBits(control, accBits, EPOCH_BITS)
    accBits += EPOCH_BITS
    const attesterId = shiftBits(control, accBits, ATTESTER_ID_BITS)
    accBits += ATTESTER_ID_BITS
    const revealNonce = shiftBits(control, accBits, REVEAL_NONCE_BITS)
    accBits += REVEAL_NONCE_BITS
    const chainId = shiftBits(control, accBits, CHAIN_ID_BITS)

    return {
        nonce,
        epoch,
        attesterId,
        revealNonce,
        chainId,
    }
}
