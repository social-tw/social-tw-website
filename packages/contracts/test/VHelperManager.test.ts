import { expect } from 'chai'
//@ts-ignore
import { genEpochKey } from '@unirep/utils'
import { ethers } from 'hardhat'
import { describe } from 'node:test'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import {
    createRandomUserIdentity,
    genProofAndVerify,
    genReportNegRepCircuitInput,
    genVHelperIdentifier,
} from './utils'

function flattenProof(proof: any) {
    return [
        proof.pi_a[0],
        proof.pi_a[1],
        proof.pi_b[0][0],
        proof.pi_b[0][1],
        proof.pi_b[1][0],
        proof.pi_b[1][1],
        proof.pi_c[0],
        proof.pi_c[1],
    ]
}

describe('Verifier Helper Manager Test', function () {
    let unirep: Unirep
    let app: UnirepApp
    let chainId: number

    // snapshot of evm environment
    let snapshot: any
    // epoch length
    const epochLength = 300

    // record and revert of evm enviroment
    {
        before(async function () {
            snapshot = await ethers.provider.send('evm_snapshot', [])
        })
        after(async function () {
            await ethers.provider.send('evm_revert', [snapshot])
        })
    }

    before(async function () {
        // deployment
        const [deployer] = await ethers.getSigners()
        const contracts = await deployApp(deployer, epochLength)
        unirep = contracts.unirep
        app = contracts.app
    })

    describe('report negative reputation proof verification tests', async function () {
        console.log(app)

        const user = createRandomUserIdentity()
        chainId = 31337
        const hashUserId = user.hashUserId
        const currentEpoch = 20
        const currentNonce = 10
        const attesterId = BigInt(123)
        const circuit = 'reportNegRepProof'
        // generate report epoch key
        const reportedEpoch = 5
        const reportedNonce = 2
        const reportedEpochKey = genEpochKey(
            BigInt(hashUserId),
            attesterId,
            reportedEpoch,
            reportedNonce,
            chainId
        )

        const reportNegRepCircuitInputs = genReportNegRepCircuitInput({
            reportedEpochKey,
            hashUserId,
            reportedEpoch,
            currentEpoch,
            currentNonce,
            attesterId,
            chainId,
        })

        it('should verify with valid proof and public signal', async function () {
            // generating proof for report negative reputation proof
            const { isValid, publicSignals, proof } = await genProofAndVerify(
                circuit,
                reportNegRepCircuitInputs
            )
            expect(isValid).to.be.equal(true)

            const currentEpochKey = publicSignals[0]
            // generate identifier
            const identifier = genVHelperIdentifier(
                'reportNegRepProofVerifierHelper'
            )

            // get verifier from identifier in unirepApp.vHelpManager
            const flattenedProof = flattenProof(proof)

            const signal = await app.verifyWithIdentifier(
                publicSignals,
                flattenedProof,
                identifier
            )
            // expect(signal).to.be.equal(currentEpochKey, "The return signal does not match the correct epochKey")
        })
        // it('should revert with invalid proof', async function () {})
    })

    describe('report nullifier proof verification tests', async function () {
        // it('should verify with valid proof and public signal', async function () {})
        // it('should revert with invalid proof', async function () {})
    })
})
