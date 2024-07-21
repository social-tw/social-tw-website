import { CircuitConfig } from '@unirep/circuits'
import * as utils from '@unirep/utils'
import { expect } from 'chai'
import { poseidon2 } from 'poseidon-lite'
import {
    createRandomUserIdentity,
    genNullifier,
    genProofAndVerify,
    genReportIdentityCircuitInput,
    randomData,
} from './utils'

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
        })
        const { isValid, publicSignals } = await genProofAndVerify(
            circuit,
            circuitInputs
        )
        expect(isValid).to.be.true
        const nullifier = publicSignals[0]
        expect(nullifier.toString()).to.be.equal(
            poseidon2([hashUserId, reportId]).toString()
        )
    })

    it('should revert with invalid identity', async () => {})
    it('should revert with wrong userId', async () => {})
    it('should revert with wrong reportId', async () => {})
    it('should revert with arbitrary nullifier', async () => {})

    // it('should revert with invalid hashUserId', async () => {
    //     const reportId = 0
    //     const currentEpoch = 20
    //     const currentNonce = 1
    //     const attesterId = BigInt(219090124810)
    //     const reportNullifier = genNullifier(user.hashUserId, reportId)
    //     const hashUserId = BigInt(123)
    //     const circuitInputs = genReportNullifierCircuitInput({
    //         reportNullifier,
    //         hashUserId,
    //         reportId,
    //         currentEpoch,
    //         currentNonce,
    //         attesterId,
    //         chainId,
    //     })
    //     try {
    //         const { isValid } = await genProofAndVerify(circuit, circuitInputs)
    //         expect(isValid).to.be.false
    //     } catch (error) {
    //         console.log('Expected error occurred:\n\n', error)
    //     }
    // })

    // it('should revert with invalid reportId', async () => {
    //     const hashUserId = user.hashUserId
    //     let reportId = 1
    //     const currentEpoch = 20
    //     const currentNonce = 1
    //     const attesterId = BigInt(219090124810)
    //     const reportNullifier = genNullifier(user.hashUserId, reportId)
    //     reportId = 2
    //     const circuitInputs = genReportNullifierCircuitInput({
    //         reportNullifier,
    //         hashUserId,
    //         reportId,
    //         currentEpoch,
    //         currentNonce,
    //         attesterId,
    //         chainId,
    //     })
    //     try {
    //         const { isValid } = await genProofAndVerify(circuit, circuitInputs)
    //         expect(isValid).to.be.false
    //     } catch (error) {
    //         console.log('Expected error occurred:\n\n', error)
    //     }
    // })
})
