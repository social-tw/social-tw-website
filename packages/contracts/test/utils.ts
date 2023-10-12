import { ethers } from 'hardhat'
import { Identity } from '@semaphore-protocol/identity'
import { SQLiteConnector } from 'anondb/node'
import { IncrementalMerkleTree } from '@unirep/utils'
import {
    CircuitConfig,
    Circuit,
    EpochKeyProof,
    EpochKeyLiteProof,
} from '@unirep/circuits'
import { schema, UserState } from '@unirep/core'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'
import { poseidon1 } from 'poseidon-lite'
import crypto from 'crypto'
import { IdentityObject } from './types'

const { FIELD_COUNT, SUM_FIELD_COUNT } = CircuitConfig.default

export function createRandomUserIdentity(): IdentityObject {
    const hash = crypto.createHash('sha3-224')
    const hashUserId = `0x${hash
        .update(new Identity().toString())
        .digest('hex')}` as string
    const id = new Identity(hashUserId) as Identity
    // console.log('Random hashed user id: ', hashUserId)

    return { hashUserId, id }
}

export function createMultipleUserIdentity(size: number): IdentityObject[] {
    let result: IdentityObject[] = []
    for (let i = 0; i < size; i++) {
        const hash = crypto.createHash('sha3-224')
        const hashUserId = `0x${hash
            .update(new Identity().toString())
            .digest('hex')}` as string
        const id = new Identity(hashUserId) as Identity
        let o: IdentityObject = { hashUserId, id }
        result.push(o)
    }
    return result
}

export async function genUserState(id, app) {
    // generate a user state
    const db = await SQLiteConnector.create(schema, ':memory:')
    const unirepAddress = await app.unirep()
    const attesterId = BigInt(app.address)
    const userState = new UserState({
        db,
        prover,
        unirepAddress,
        provider: ethers.provider,
        attesterId,
        id,
    })
    await userState.sync.start()
    await userState.waitForSync()
    return userState
}

export async function genEpochKeyProof(config: {
    id: Identity
    tree: IncrementalMerkleTree
    leafIndex: number
    epoch: number
    nonce: number
    attesterId: number | bigint
    data?: bigint[]
    sigData?: bigint
    revealNonce?: number
}) {
    const {
        id,
        tree,
        leafIndex,
        epoch,
        nonce,
        attesterId,
        data: _data,
        sigData,
        revealNonce,
    } = Object.assign(
        {
            data: [],
        },
        config
    )
    const data = [..._data, ...Array(FIELD_COUNT - _data.length).fill(0)]
    const _proof = tree.createProof(leafIndex)
    const circuitInputs = {
        state_tree_elements: _proof.siblings,
        state_tree_indexes: _proof.pathIndices,
        identity_secret: id.secret,
        data,
        sig_data: sigData ?? BigInt(0),
        nonce,
        epoch,
        attester_id: attesterId,
        reveal_nonce: revealNonce ?? 0,
    }
    const r = await prover.genProofAndPublicSignals(
        Circuit.epochKey,
        circuitInputs
    )

    const { publicSignals, proof } = new EpochKeyProof(
        r.publicSignals,
        r.proof,
        prover
    )

    return { publicSignals, proof }
}

export async function genEpochKeyLiteProof(config: {
    id: Identity
    epoch: number
    nonce: number
    attesterId: number | bigint
    sigData?: bigint
    revealNonce?: number
}) {
    const { id, epoch, nonce, attesterId, sigData, revealNonce } =
        Object.assign(
            {
                data: [],
            },
            config
        )
    const circuitInputs = {
        identity_secret: id.secret,
        reveal_nonce: revealNonce ?? 0,
        attester_id: attesterId,
        epoch,
        nonce,
        sig_data: sigData ?? BigInt(0),
    }

    const r = await prover.genProofAndPublicSignals(
        Circuit.epochKeyLite,
        circuitInputs
    )

    const { publicSignals, proof } = new EpochKeyLiteProof(
        r.publicSignals,
        r.proof,
        prover
    )

    return { publicSignals, proof }
}

export const randomData = () => [
    ...Array(SUM_FIELD_COUNT)
        .fill(0)
        .map(() => poseidon1([Math.floor(Math.random() * 199191919)])),
    ...Array(FIELD_COUNT - SUM_FIELD_COUNT)
        .fill(0)
        .map(
            () =>
                poseidon1([Math.floor(Math.random() * 199191919)]) %
                BigInt(2) ** BigInt(253)
        ),
]
