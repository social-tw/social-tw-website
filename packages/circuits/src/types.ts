import { Identity } from '@semaphore-protocol/identity'

export type IdentityObject = { hashUserId: string; id: Identity }

export type EpochKeyControl = {
    nonce: bigint
    epoch: bigint
    attesterId: bigint
    revealNonce: bigint
    chainId: bigint
}

export enum UnirepSocialCircuit {
    reportIdentityProof = 'reportIdentityProof',
    reportNullifierProof = 'reportNullifierProof',
    reportNonNullifierProof = 'reportNonNullifierProof',
    dailyClaimProof = 'dailyClaimProof',
}
