import { CircuitConfig } from '@unirep/circuits'
import * as utils from '@unirep/utils'
import { IncrementalMerkleTree as zkIncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree'
import { expect } from 'chai'
import { poseidon2 } from 'poseidon-lite'
import { DailyClaimProof } from '../src'
import { UnirepSocialCircuit } from '../src/types'
import { ProofGenerationError } from './error'
import {
    createRandomUserIdentity,
    genDailyClaimCircuitInput,
    genNullifier,
    genProofAndVerify,
    genReputationCircuitInput,
} from './utils'

const circuit = UnirepSocialCircuit.dailyClaimProof

describe('Prove report identity in Unirep Social-TW', function () {
    this.timeout(300000)
    /**
     * 1. should succeed with valid inputs
     * 2. should revert with reputation > 0
     * 3. should revert with wrong reputation proof
     * 4. should revert with wrong daily nullifier
     */

    const chainId = 31337
    const user = createRandomUserIdentity()
    const { STATE_TREE_DEPTH, FIELD_COUNT } = CircuitConfig.default

    const attesterId = BigInt(10210)
    const epoch = BigInt(120958)
    const tree: zkIncrementalMerkleTree = new utils.IncrementalMerkleTree(
        STATE_TREE_DEPTH
    )
    const data = [...Array(FIELD_COUNT).fill(0)]
    const leaf = utils.genStateTreeLeaf(
        user.id.secret,
        attesterId,
        epoch,
        data,
        chainId
    )
    tree.insert(leaf)
    const leafIndex = tree.indexOf(leaf)
    const leafProof = tree.createProof(leafIndex)

    it('should succeed with valid inputs', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 0
        const dailyNullifier = genNullifier(user.id, dailyEpoch)
        data[1] = 1

        const reputationCircuitInput = genReputationCircuitInput({
            identitySecret,
            epoch: epoch,
            nonce: 0,
            attesterId: attesterId,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
            data: data,
            chainId: chainId,
        })

        const circuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationCircuitInput,
        })

        const { isValid, proof, publicSignals } = await genProofAndVerify(
            circuit,
            circuitInputs
        )

        const dailyClaimProof = new DailyClaimProof(publicSignals, proof)

        expect(isValid).to.be.true
        expect(dailyClaimProof.dailyNullifier.toString()).to.be.equal(
            poseidon2([identitySecret, dailyEpoch]).toString()
        )
        expect(dailyClaimProof.attesterId).to.be.equal(attesterId)
        expect(dailyClaimProof.epoch).to.be.equal(epoch)
    })

    it('should revert with reputation > 0', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 0
        const dailyNullifier = genNullifier(user.id, dailyEpoch)
        data[0] = 2

        const reputationCircuitInput = genReputationCircuitInput({
            identitySecret,
            epoch: epoch,
            nonce: 0,
            attesterId: attesterId,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
            data: data,
            chainId: chainId,
        })

        const circuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationCircuitInput,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template DailyClaimProof_97 line: 64\n'
            )
        }
    })

    it('should revert with wrong reputation proof', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 0
        const dailyNullifier = genNullifier(user.id, dailyEpoch)
        const wrongAttesterId =
            BigInt(2) ** CircuitConfig.default.ATTESTER_ID_BITS
        data[0] = 0

        const reputationCircuitInput = genReputationCircuitInput({
            identitySecret,
            epoch: epoch,
            nonce: 0,
            attesterId: attesterId,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
            data: data,
            chainId: chainId,
        })

        reputationCircuitInput.attester_id = wrongAttesterId

        const circuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationCircuitInput,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template Num2Bits_3 line: 38\nError in template Reputation_93 line: 111\nError in template DailyClaimProof_97 line: 43\n'
            )
        }
    })

    it('should revert with wrong daily nullifier', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 0
        const dailyNullifier = genNullifier(user.id, dailyEpoch)
        const wrongDailyEpoch = 444

        const reputationCircuitInput = genReputationCircuitInput({
            identitySecret,
            epoch: epoch,
            nonce: 0,
            attesterId: attesterId,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
            data: data,
            maxRep: 1,
            chainId: chainId,
        })

        const circuitInputs = genDailyClaimCircuitInput({
            dailyEpoch: wrongDailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationCircuitInput,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template DailyClaimProof_97 line: 68\n'
            )
        }
    })
})
