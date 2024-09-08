import {
    ATTESTER_ID_BITS,
    CHAIN_ID_BITS,
    EPOCH_BITS,
    NONCE_BITS,
    REVEAL_NONCE_BITS,
} from '@unirep/utils'
import { EpochKeyControl } from './types'
import { Identity } from '@semaphore-protocol/identity'
import { poseidon2 } from 'poseidon-lite'

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

export const shiftBits = (
    data: bigint,
    shiftBits: bigint,
    variableBits: bigint
): bigint => {
    return (data >> shiftBits) & ((BigInt(1) << variableBits) - BigInt(1))
}
