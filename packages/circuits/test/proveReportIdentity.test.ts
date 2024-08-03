import { CircuitConfig } from '@unirep/circuits'
import * as utils from '@unirep/utils'
import { IncrementalMerkleTree as zkIncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree'
import { expect } from 'chai'
import { poseidon2 } from 'poseidon-lite'
import {
    createRandomUserIdentity,
    genNullifier,
    genProofAndVerify,
    genReportIdentityCircuitInput,
    randomData,
} from './utils'
import { ProofGenerationError } from '../src/types/ProofGenerationError'

const circuit = 'reportIdentityProof'

describe('Prove report identity in Unirep Social-TW', function () {
    this.timeout(300000)
    /**
     * 1. should succeed with valid inputs
     * 2. should revert with invalid identity
     * 3. should revert with wrong userId
     * 4. should revert with wrong reportId
     * 5. should revert with arbitrary nullifier
     */

    const chainId = 31337
    const user = createRandomUserIdentity()
    const { STATE_TREE_DEPTH } = CircuitConfig.default

    const attesterId = BigInt(10210)
    const epoch = BigInt(120958)
    const tree: zkIncrementalMerkleTree = new utils.IncrementalMerkleTree(
        STATE_TREE_DEPTH
    )
    const data = randomData()
    const leaf = utils.genStateTreeLeaf(
        user.id.secret,
        attesterId,
        epoch,
        data,
        chainId
    )
    tree.insert(leaf)
    const leafIndex = tree.indexOf(leaf)
    const proof = tree.createProof(leafIndex)
    const stateTreeRoot = tree.root

    it('should succeed with valid inputs', async () => {
        const identitySecret = user.id.secret
        const hashUserId = user.hashUserId
        const reportId = 0
        const reportNullifier = genNullifier(hashUserId, reportId)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier,
            identitySecret,
            hashUserId,
            reportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: proof.siblings,
            stateTreeIndices: proof.pathIndices,
            stateTreeRoot,
        })
        const { isValid, publicSignals } = await genProofAndVerify(
            circuit,
            circuitInputs
        )
        expect(isValid).to.be.true
        expect(publicSignals[0].toString()).to.be.equal(
            poseidon2([hashUserId, reportId]).toString()
        )
        expect(publicSignals[1].toString()).to.be.equal(epoch.toString())
        expect(publicSignals[2].toString()).to.be.equal(
            stateTreeRoot.toString()
        )
    })

    it('should revert with invalid identity', async () => {
        const wrongIdentitySecret = BigInt(444)
        const hashUserId = user.hashUserId
        const reportId = 0
        const reportNullifier = genNullifier(hashUserId, reportId)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier,
            identitySecret: wrongIdentitySecret,
            hashUserId,
            reportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: proof.siblings,
            stateTreeIndices: proof.pathIndices,
            stateTreeRoot,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Proof Generation Error: the proof cannot be generated since the inputs are invalid'
            )
        }
    })

    it('should revert with wrong hashUserId', async () => {
        const identitySecret = user.id.secret
        const reportId = 0
        const reportNullifier = genNullifier(user.hashUserId, reportId)
        const hashUserId = BigInt(123)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier,
            identitySecret,
            hashUserId,
            reportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: proof.siblings,
            stateTreeIndices: proof.pathIndices,
            stateTreeRoot,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Proof Generation Error: the proof cannot be generated since the inputs are invalid'
            )
        }
    })

    it('should revert with wrong reportId', async () => {
        const identitySecret = user.id.secret
        const hashUserId = user.hashUserId
        const reportId = 0
        const wrongReportId = 444
        const reportNullifier = genNullifier(user.hashUserId, reportId)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier,
            identitySecret,
            hashUserId,
            reportId: wrongReportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: proof.siblings,
            stateTreeIndices: proof.pathIndices,
            stateTreeRoot,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Proof Generation Error: the proof cannot be generated since the inputs are invalid'
            )
        }
    })

    it('should revert with arbitrary nullifier', async () => {
        const identitySecret = user.id.secret
        const hashUserId = user.hashUserId
        const reportId = 0
        const wrongReportNullifier = BigInt(444)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier: wrongReportNullifier,
            identitySecret,
            hashUserId,
            reportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: proof.siblings,
            stateTreeIndices: proof.pathIndices,
            stateTreeRoot,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Proof Generation Error: the proof cannot be generated since the inputs are invalid'
            )
        }
    })
})
