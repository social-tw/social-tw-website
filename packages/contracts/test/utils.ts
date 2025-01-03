//@ts-ignore
import { Identity } from '@semaphore-protocol/identity'
import {
    defaultProver,
    defaultProver as prover,
} from '@unirep-app/circuits/provers/defaultProver'
import {
    Circuit,
    CircuitConfig,
    EpochKeyLiteProof,
    EpochKeyProof,
} from '@unirep/circuits'
import { userSchema as schema, UserState } from '@unirep/core'
import { IncrementalMerkleTree, stringifyBigInts } from '@unirep/utils'
import { SQLiteConnector } from 'anondb/node'
import crypto from 'crypto'
import { ethers } from 'hardhat'

import { poseidon1, poseidon2 } from 'poseidon-lite'
import { ProofGenerationError } from './error'
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
    await userState.start()
    await userState.waitForSync()
    return userState
}

export async function genEpochKeyProof(config: {
    id: Identity
    tree: IncrementalMerkleTree
    leafIndex: number
    epoch: number
    nonce: number
    chainId: number
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
        chainId,
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
        state_tree_indices: _proof.pathIndices,
        identity_secret: id.secret,
        data,
        sig_data: sigData ?? BigInt(0),
        nonce,
        epoch,
        chain_id: chainId,
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
    chainId: number
    sigData?: bigint
    revealNonce?: number
}) {
    const { id, epoch, nonce, attesterId, chainId, sigData, revealNonce } =
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
        chain_id: chainId,
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

export function genReportNonNullifierCircuitInput(config: {
    reportedEpochKey: any
    identitySecret: string | bigint | Identity
    reportedEpoch: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
}) {
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
    return stringifyBigInts(circuitInputs)
}

export function genReportNullifierCircuitInput(config: {
    reportNullifier: any
    identitySecret: string | bigint
    reportId: number | bigint
    currentEpoch: number | bigint
    currentNonce: number | bigint
    chainId: number | bigint
    attesterId: number | bigint
}) {
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
    return stringifyBigInts(circuitInputs)
}

export async function genProofAndVerify(
    circuit: Circuit | string,
    circuitInputs: any
) {
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
            throw new ProofGenerationError(error.message)
        } else {
            throw new Error('Unknown Error...')
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

export function genVHelperIdentifier(identifier: string): string {
    const encodedId = ethers.utils.defaultAbiCoder.encode(
        ['string'],
        [identifier]
    )
    return ethers.utils.keccak256(encodedId)
}

export function flattenProof(proof: any) {
    return [
        proof.pi_a[0],
        proof.pi_a[1],
        proof.pi_b[0][1],
        proof.pi_b[0][0],
        proof.pi_b[1][1],
        proof.pi_b[1][0],
        proof.pi_c[0],
        proof.pi_c[1],
    ]
}

export function genNullifier(identity: Identity, reportId: number | bigint) {
    return poseidon2([identity.secret, reportId])
}

export async function userStateTransition(
    userState: UserState,
    unirep: any,
    app: any
) {
    const latestEpoch = await unirep.attesterCurrentEpoch(app.address)
    const remainingTime = await unirep.attesterEpochRemainingTime(app.address)
    // epoch transition
    await ethers.provider.send('evm_increaseTime', [remainingTime])
    await ethers.provider.send('evm_mine', [])

    const toEpoch = latestEpoch + 1
    await userState.waitForSync()
    const { publicSignals, proof } =
        await userState.genUserStateTransitionProof({
            toEpoch,
        })
    const tx = await unirep.userStateTransition(publicSignals, proof)
    await tx.wait()

    await userState.waitForSync()
}
