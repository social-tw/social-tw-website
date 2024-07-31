import { CircuitConfig } from '@unirep/circuits'
import * as utils from '@unirep/utils'
import { IncrementalMerkleTree as zkIncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree'
import { expect } from 'chai'
import { poseidon2 } from 'poseidon-lite'
import { ReportIdentityProof } from '../src'
import { ProofGenerationError } from './error'
import { UnirepSocialCircuit } from './types'
import {
    createRandomUserIdentity,
    genNullifier,
    genProofAndVerify,
    genReportIdentityCircuitInput,
    randomData,
} from './utils'

const circuit = UnirepSocialCircuit.reportIdentityProof

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
    const leafProof = tree.createProof(leafIndex)
    const stateTreeRoot = tree.root

    it('should succeed with valid inputs', async () => {
        const identitySecret = user.id.secret
        const reportId = 0
        const reportNullifier = genNullifier(user.id, reportId)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier,
            identitySecret,
            reportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: leafProof.siblings,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeRoot,
        })
        const { isValid, proof, publicSignals } = await genProofAndVerify(
            circuit,
            circuitInputs
        )

        const reportIdentityProof = new ReportIdentityProof(
            publicSignals,
            proof
        )

        expect(isValid).to.be.true
        expect(reportIdentityProof.reportNullifier.toString()).to.be.equal(
            poseidon2([identitySecret, reportId]).toString()
        )
        expect(reportIdentityProof.attesterId).to.be.equal(attesterId)
        expect(reportIdentityProof.epoch).to.be.equal(epoch)
        expect(reportIdentityProof.stateTreeRoot).to.be.equal(stateTreeRoot)
    })

    it('should revert with invalid identity', async () => {
        const wrongIdentitySecret = BigInt(444)
        const reportId = 0
        const reportNullifier = genNullifier(user.id, reportId)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier,
            identitySecret: wrongIdentitySecret,
            reportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: leafProof.siblings,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeRoot,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template ReportIdentityProof_75 line: 35\n'
            )
        }
    })

    it('should revert with wrong reportId', async () => {
        const identitySecret = user.id.secret
        const reportId = 0
        const wrongReportId = 444
        const reportNullifier = genNullifier(user.id, reportId)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier,
            identitySecret,
            reportId: wrongReportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: leafProof.siblings,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeRoot,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template ReportIdentityProof_75 line: 39\n'
            )
        }
    })

    it('should revert with arbitrary nullifier', async () => {
        const identitySecret = user.id.secret
        const reportId = 0
        const wrongReportNullifier = BigInt(444)
        const circuitInputs = genReportIdentityCircuitInput({
            reportNullifier: wrongReportNullifier,
            identitySecret,
            reportId,
            data,
            attesterId,
            epoch,
            chainId,
            stateTreeElements: leafProof.siblings,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeRoot,
        })

        try {
            await genProofAndVerify(circuit, circuitInputs)
        } catch (error: unknown) {
            expect?.(error).to.be.an.instanceof(ProofGenerationError)
            expect?.(error).to.have.property(
                'message',
                'Error: Assert Failed. Error in template ReportIdentityProof_75 line: 39\n'
            )
        }
    })
})
