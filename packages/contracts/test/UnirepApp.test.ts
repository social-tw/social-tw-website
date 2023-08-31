//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployUnirep, deployVerifierHelper } from '@unirep/contracts/deploy'
import { CircuitConfig, Circuit } from '@unirep/circuits'
import { stringifyBigInts } from '@unirep/utils'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { DataProof } from '@unirep-app/circuits'
import { Identity } from '@semaphore-protocol/identity'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'
import crypto from 'crypto'
import { describe } from 'node:test'

const { SUM_FIELD_COUNT } = CircuitConfig.default

function createRandomUserIdentity(): [string, Identity] {
    const hash = crypto.createHash('sha3-224')
    const hashUserId = `0x${hash
        .update(new Identity().toString())
        .digest('hex')}` as string
    const id = new Identity(hashUserId) as Identity
    // console.log('Random hashed user id: ', hashUserId)

    return [hashUserId, id]
}

async function genUserState(id, app) {
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

describe('Unirep App', function () {
    let unirep
    let app
    let hashUserId: string
    let id: Identity
    let inputPublicSig
    let inputProof

    // epoch length
    const epochLength = 300

    before(async () => {
        // generate random hash user id
        ;[hashUserId, id] = createRandomUserIdentity()

        // deployment
        const [deployer] = await ethers.getSigners()
        unirep = await deployUnirep(deployer)
        const helper = await deployVerifierHelper(deployer, Circuit.epochKey)
        const verifierF = await ethers.getContractFactory('DataProofVerifier')
        const verifier = await verifierF.deploy()
        await verifier.deployed()
        const App = await ethers.getContractFactory('UnirepApp')
        app = await App.deploy(
            unirep.address,
            helper.address,
            verifier.address,
            epochLength
        )
        await app.deployed()
    })

    describe('user signup', () => {
        it('init user status', async () => {
            expect(await app.initUserStatus(hashUserId))
                .to.emit(app, 'UserInitSuccess')
                .withArgs(hashUserId)
        })

        it('user sign up after init', async () => {
            const userState = await genUserState(id, app)

            // get user status, should be RegisterStatus.INIT
            expect(await app.queryUserStatus(hashUserId)).to.equal(1)

            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            expect(
                await app.userSignUp(publicSignals, proof, hashUserId, false)
            )
                .to.emit(app, 'UserSignUpSuccess')
                .withArgs(hashUserId)

            // get user status, should be RegisterStatus.REGISTERED_SERVER
            expect(await app.queryUserStatus(hashUserId)).to.equal(2)

            userState.stop()
        })

        it('revert when user sign up multiple times', async () => {
            const userState = await genUserState(id, app)

            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            expect(
                app.userSignUp(publicSignals, proof, hashUserId, false)
            ).to.be.revertedWithCustomError(app, 'UserAlreadySignedUp')

            userState.stop()
        })

        it('revert when user sign up without init', async () => {
            const [hashUserId, id] = createRandomUserIdentity()

            const userState = await genUserState(id, app)

            // get user status, should be RegisterStatus.NOT_REGISTER
            expect(await app.queryUserStatus(hashUserId)).to.equal(0)

            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            expect(
                app.userSignUp(publicSignals, proof, hashUserId, true)
            ).to.be.revertedWithCustomError(app, 'UserInitStatusInvalid')

            userState.stop()
        })

        it('revert when reuse user signup proof', async () => {
            const [hashUserId, id] = createRandomUserIdentity()
            const userState = await genUserState(id, app)

            expect(await app.initUserStatus(hashUserId))
                .to.emit(app, 'UserInitSuccess')
                .withArgs(hashUserId)

            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            const invalidProof = proof
                .slice(0, proof.length - 1)
                .concat([BigInt(0)])

            // get user status, should be RegisterStatus.INIT
            expect(await app.queryUserStatus(hashUserId)).to.equal(1)

            expect(
                app.userSignUp(publicSignals, invalidProof, hashUserId, true)
            ).to.be.reverted

            userState.stop()
        })
    })

    describe('user post', () => {
        it('should fail to post with invalid proof', async () => {
            const userState = await genUserState(id, app)
            const { publicSignals, proof } = await userState.genEpochKeyProof()

            inputPublicSig = publicSignals
            inputProof = proof

            // generate a fake proof
            const concoctProof = [...proof]
            const len = concoctProof[0].toString().length
            concoctProof[0] = BigInt(
                proof[0].toString().slice(0, len - 1) + BigInt(2)
            )
            const content = 'invalid proof'

            expect(app.post(inputPublicSig, concoctProof, content)).to.be
                .reverted // revert in epkHelper.verifyAndCheck()
        })

        it('should post with valid proof', async () => {
            const content = 'testing'

            expect(app.post(inputPublicSig, inputProof, content))
                .to.emit(app, 'Post')
                .withArgs(inputPublicSig[0], 0, 0, content)
        })

        it('should fail to post with reused proof', async () => {
            const content = 'reused proof'
            expect(
                app.post(inputPublicSig, inputProof, content)
            ).to.be.revertedWith('The proof has been used before')
        })
    })

    describe('user state', () => {
        it('submit attestations', async () => {
            const userState = await genUserState(id, app)
            const nonce = 0
            const { publicSignals, proof, epochKey, epoch } =
                await userState.genEpochKeyProof({ nonce })
            const [deployer] = await ethers.getSigners()
            const epkVerifier = await deployVerifierHelper(
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

        it('user state transition', async () => {
            await ethers.provider.send('evm_increaseTime', [epochLength])
            await ethers.provider.send('evm_mine', [])

            const newEpoch = await unirep.attesterCurrentEpoch(app.address)
            const userState = await genUserState(id, app)
            const { publicSignals, proof } =
                await userState.genUserStateTransitionProof({
                    toEpoch: newEpoch,
                })
            await unirep
                .userStateTransition(publicSignals, proof)
                .then((t) => t.wait())
            userState.stop()
        }).timeout(100000)

        it('data proof', async () => {
            const userState = await genUserState(id, app)
            const epoch = await userState.sync.loadCurrentEpoch()
            const stateTree = await userState.sync.genStateTree(epoch)
            const index = await userState.latestStateTreeLeafIndex(epoch)
            const stateTreeProof = stateTree.createProof(index)
            const attesterId = app.address
            const data = await userState.getProvableData()
            const value = Array(SUM_FIELD_COUNT).fill(0)
            const circuitInputs = stringifyBigInts({
                identity_secret: id.secret,
                state_tree_indexes: stateTreeProof.pathIndices,
                state_tree_elements: stateTreeProof.siblings,
                data: data,
                epoch: epoch,
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
