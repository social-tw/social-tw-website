import { Identity } from '@semaphore-protocol/identity'
import { Circuit } from '@unirep/circuits'
import * as utils from '@unirep/utils'
import crypto from 'crypto'
import { poseidon2 } from 'poseidon-lite'
import { defaultProver } from '../provers/defaultProver'
import { IdentityObject } from './types'

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

export const genNullifier = (hashUserId: string, postId: number | bigint) => {
    return poseidon2([hashUserId, postId])
}

export const genReportNegRepCircuitInput = (config: {
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

export const genReportNullifierCircuitInput = (config: {
    reportNullifier: any
    hashUserId: string | bigint
    postId: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
}) => {
    const {
        reportNullifier,
        hashUserId,
        postId,
        currentEpoch,
        currentNonce,
        chainId,
        attesterId,
    } = Object.assign(config)

    const circuitInputs = {
        report_nullifier: reportNullifier,
        hash_user_id: hashUserId,
        post_id: postId,
        current_epoch: currentEpoch,
        current_nonce: currentNonce,
        chain_id: chainId,
        attester_id: attesterId,
    }
    return utils.stringifyBigInts(circuitInputs)
}
