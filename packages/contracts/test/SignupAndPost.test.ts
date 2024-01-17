//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployVerifierHelper } from '@unirep/contracts/deploy'
import { CircuitConfig, Circuit } from '@unirep/circuits'
import {
    stringifyBigInts,
    IncrementalMerkleTree,
    genStateTreeLeaf,
} from '@unirep/utils'
import { DataProof } from '@unirep-app/circuits'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'
import { describe } from 'node:test'
import { deployApp } from '../scripts/utils'
import {
    createRandomUserIdentity,
    genEpochKeyProof,
    genUserState,
    randomData,
} from './utils'
import { IdentityObject } from './types'

const { FIELD_COUNT, STATE_TREE_DEPTH } = CircuitConfig.default

describe('Unirep App', function () {
    let unirep: any
    let app: any
    let user: IdentityObject
    let inputPublicSig: any
    let inputProof: any
    let chainId: number

    // epoch length
    const epochLength = 100000

    before(async function () {
        // generate random hash user id
        user = createRandomUserIdentity()

        // deployment
        const [deployer] = await ethers.getSigners()
        const contracts = await deployApp(deployer, epochLength)
        unirep = contracts.unirep
        app = contracts.app

        chainId = await unirep.chainid()
    })

    describe('user signup', function () {
        it('user sign up after init', async function () {
            const userState = await genUserState(user.id, app)
            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            expect(
                await app.userSignUp(
                    publicSignals,
                    proof,
                    user.hashUserId,
                    false
                )
            )
                .to.emit(app, 'UserSignUp')
                .withArgs(user.hashUserId, false)

            // get user status, should be RegisterStatus.REGISTERED_SERVER
            expect(await app.userRegistry(user.hashUserId)).to.equal(true)

            userState.stop()
        })

        it('revert when user sign up multiple times', async function () {
            const userState = await genUserState(user.id, app)

            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            await expect(
                app.userSignUp(publicSignals, proof, user.hashUserId, false)
            ).to.be.revertedWithCustomError(app, 'UserHasRegistered')

            userState.stop()
        })

        it('revert when user uses an invalid signup proof', async function () {
            const user = createRandomUserIdentity()
            const userState = await genUserState(user.id, app)

            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            const invalidProof = proof
                .slice(0, proof.length - 1)
                .concat([BigInt(0)])

            await expect(
                app.userSignUp(
                    publicSignals,
                    invalidProof,
                    user.hashUserId,
                    true
                )
            ).to.be.reverted

            userState.stop()
        })
    })

    describe('user post', function () {
        it('should fail to post with invalid proof', async function () {
            const userState = await genUserState(user.id, app)
            const { publicSignals, proof } = await userState.genEpochKeyProof()

            // generate a fake proof
            const concoctProof = [...proof]
            const len = concoctProof[0].toString().length
            concoctProof[0] = BigInt(
                proof[0].toString().slice(0, len - 1) + BigInt(2)
            )
            const content = 'Invalid Proof'

            await expect(app.post(publicSignals, concoctProof, content)).to.be
                .reverted // revert in epkHelper.verifyAndCheck()
        })

        it('should post with valid proof', async function () {
            const content = 'Valid Proof'
            const userState = await genUserState(user.id, app)
            const { publicSignals, proof } = await userState.genEpochKeyProof()

            inputPublicSig = publicSignals
            inputProof = proof

            await expect(app.post(publicSignals, proof, content))
                .to.emit(app, 'Post')
                .withArgs(publicSignals[0], 0, 0, content)
        })

        it('should post and have the correct postId', async function () {
            const content = 'Valid Proof'
            const userState = await genUserState(user.id, app)
            const { publicSignals, proof } = await userState.genEpochKeyProof()

            inputPublicSig = publicSignals
            inputProof = proof

            await expect(app.post(publicSignals, proof, content))
                .to.emit(app, 'Post')
                .withArgs(publicSignals[0], 1, 0, content)
        })

        it('should fail to post with reused proof', async function () {
            const content = 'Reused Proof'
            await expect(
                app.post(inputPublicSig, inputProof, content)
            ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
        })

        it('should fail to post with invalid epoch', async function () {
            const userState = await genUserState(user.id, app)
            const id = user.id
            // generating a proof with wrong epoch
            const wrongEpoch = 44444
            const attesterId = userState.sync.attesterId
            const epoch = await userState.sync.loadCurrentEpoch()
            const tree = await userState.sync.genStateTree(epoch, attesterId)
            const leafIndex = await userState.latestStateTreeLeafIndex(
                epoch,
                attesterId
            )
            const data = randomData()
            const { publicSignals, proof } = await genEpochKeyProof({
                id,
                tree,
                leafIndex,
                epoch: wrongEpoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            await expect(
                app.post(publicSignals, proof, 'Invalid Epoch')
            ).to.be.revertedWithCustomError(app, 'InvalidEpoch')
        })

        it('should fail to post with invalid state tree', async function () {
            const userState = await genUserState(user.id, app)
            const id = user.id
            // generate a proof with invalid state tree
            const attesterId = userState.sync.attesterId
            const epoch = await userState.sync.loadCurrentEpoch()
            const tree = new IncrementalMerkleTree(STATE_TREE_DEPTH)
            const data = randomData()
            const leaf = genStateTreeLeaf(
                id.secret,
                attesterId,
                epoch,
                data,
                chainId
            )
            tree.insert(leaf)
            const { publicSignals, proof } = await genEpochKeyProof({
                id,
                tree,
                leafIndex: 0,
                epoch,
                nonce: 0,
                chainId,
                attesterId,
                data,
            })
            await expect(
                app.post(publicSignals, proof, 'Invalid State Tree')
            ).to.be.revertedWithCustomError(app, 'InvalidStateTreeRoot')
        })
    })

    describe('user state', function () {
        it('submit attestations', async function () {
            const userState = await genUserState(user.id, app)
            const nonce = 0
            const { publicSignals, proof, epochKey, epoch } =
                await userState.genEpochKeyProof({ nonce })
            const [deployer] = await ethers.getSigners()
            const epkVerifier = await deployVerifierHelper(
                unirep.address,
                deployer,
                Circuit.epochKey
            )
            await epkVerifier.verifyAndCheck(publicSignals, proof)

            const field = 0
            const val = 10
            await app
                .submitAttestation(epochKey, epoch, field, val)
                .then((t) => t.wait())
            userState.stop()
        })

        it('user state transition', async function () {
            await ethers.provider.send('evm_increaseTime', [epochLength])
            await ethers.provider.send('evm_mine', [])

            const newEpoch = await unirep.attesterCurrentEpoch(app.address)
            const userState = await genUserState(user.id, app)
            const { publicSignals, proof } =
                await userState.genUserStateTransitionProof({
                    toEpoch: newEpoch,
                })
            await unirep
                .userStateTransition(publicSignals, proof)
                .then((t) => t.wait())
            userState.stop()
        })

        it('data proof', async function () {
            const userState = await genUserState(user.id, app)
            const epoch = await userState.sync.loadCurrentEpoch()
            const stateTree = await userState.sync.genStateTree(epoch)
            const index = await userState.latestStateTreeLeafIndex(epoch)
            const stateTreeProof = stateTree.createProof(index)
            const attesterId = app.address
            const data = await userState.getProvableData()
            const value = Array(FIELD_COUNT).fill(0)
            const circuitInputs = stringifyBigInts({
                identity_secret: user.id.secret,
                state_tree_indices: stateTreeProof.pathIndices,
                state_tree_elements: stateTreeProof.siblings,
                data: data,
                epoch: epoch,
                chain_id: chainId,
                attester_id: attesterId,
                value: value,
            })
            const p = await prover.genProofAndPublicSignals(
                'dataProof',
                circuitInputs
            )
            const { publicSignals, proof } = new DataProof(
                p.publicSignals,
                p.proof,
                prover
            )
            const isValid = await app.verifyDataProof(publicSignals, proof)
            expect(isValid).to.be.true
            userState.stop()
        })
    })
})
