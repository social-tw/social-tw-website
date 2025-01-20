// @ts-ignore
import { DailyClaimProof } from '@unirep-app/circuits'
import { ReputationProof } from '@unirep/circuits'
import { genEpochKey } from '@unirep/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createRandomUserIdentity,
    flattenProof,
    genDailyClaimCircuitInput,
    genNullifier,
    genProofAndVerify,
    genUserState,
    genVHelperIdentifier,
    userStateTransition,
} from './utils'

describe('Claim Daily Login Reputation Test', function () {
    this.timeout(1000000)
    let unirep: Unirep
    let app: UnirepApp
    let chainId: number
    let attesterId: bigint
    let user: IdentityObject

    let snapshot: any
    const epochLength = 300
    const dailyEpochLength = 24 * 60 * 60

    const POS_REP = 5
    const NEG_REP = 10
    const circuit = 'dailyClaimProof'
    const identifier = genVHelperIdentifier('dailyClaimProofVerifierHelper')

    let usedProof: any
    let usedPublicSignals: any

    {
        before(async function () {
            snapshot = await ethers.provider.send('evm_snapshot', [])
        })
        after(async function () {
            await ethers.provider.send('evm_revert', [snapshot])
        })
    }

    before(async function () {
        try {
            const [deployer] = await ethers.getSigners()
            const contracts = await deployApp(deployer, epochLength)
            unirep = contracts.unirep
            app = contracts.app

            user = createRandomUserIdentity()

            chainId = await unirep.chainid()

            const userState = await genUserState(user.id, app)
            attesterId = userState.sync.attesterId

            {
                const { publicSignals, proof } =
                    await userState.genUserSignUpProof()
                await app.userSignUp(
                    publicSignals,
                    proof,
                    user.hashUserId,
                    false
                )
                await app
                    .userRegistry(user.hashUserId)
                    .then((res) => expect(res).to.be.true)
                console.log('user register success...')
            }

            await userState.waitForSync()

            const epoch = await userState.sync.loadCurrentEpoch()

            const maxRep = 2
            const epochKey = genEpochKey(
                userState.id.secret,
                app.address,
                epoch,
                0,
                chainId
            )
            const field = userState.sync.settings.sumFieldCount

            await app
                .submitAttestation(epochKey, epoch, field, maxRep)
                .then((t) => t.wait())

            // setting posRep to 5
            await app
                .submitAttestation(epochKey, epoch, 0, POS_REP)
                .then((t) => t.wait())

            // setting negRep to 10
            await app
                .submitAttestation(epochKey, epoch, 1, NEG_REP)
                .then((t) => t.wait())

            await ethers.provider.send('evm_increaseTime', [epochLength])
            await ethers.provider.send('evm_mine', [])

            const toEpoch = await unirep.attesterCurrentEpoch(app.address)
            {
                await userState.waitForSync()
                const { publicSignals, proof } =
                    await userState.genUserStateTransitionProof({
                        toEpoch,
                    })
                await unirep
                    .userStateTransition(publicSignals, proof)
                    .then((t) => t.wait())
            }

            await userState.waitForSync()
            const proof = await userState.genProveReputationProof({
                maxRep,
            })

            const valid = await proof.verify()
            expect(valid).to.be.true
            expect(proof.maxRep).to.equal(maxRep.toString())
            expect(proof.proveMaxRep).to.equal('1')

            userState.stop()
        } catch (err) {
            console.error(err)
        }
    })

    /**
     * 1. succeed to claim daily login reputation
     * 2. revert with not owner
     * 3. revert with wrong proof
     * 4. revert when a user with rep<0 claims the login rep again within 1 day
     * 5. revert with invalid epoch
     * 6. revert with positive repuation user
     * 7. revert with invalid daily epoch
     * 8. revert after the a user with rep<0 claim the login rep and his reputation become 0 => the user cannot claim
     * 9. succeed a user with rep>0 cannot claim => attest neg_rep to the user => the user can claim
     */
    it('should claim daily login reputation', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 0
        const dailyNullifier = genNullifier(user.id, dailyEpoch)

        const userState = await genUserState(user.id, app)
        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()
        const reputationProof = await userState.genProveReputationProof({})

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        const tx = await app.claimDailyLoginRep(
            publicSignals,
            flattenedProof,
            identifier
        )
        await expect(tx)
            .to.emit(app, 'ClaimPosRep')
            .withArgs(publicSignals[0], epoch)

        await userStateTransition(userState, unirep, app)

        data = await userState.getData()
        // data[0] positive reputation
        expect(data[0]).equal(POS_REP + 1)

        usedProof = flattenedProof
        usedPublicSignals = publicSignals
    })

    it('should revert with not owner', async () => {
        const notOwner = await ethers.getSigners().then((signers) => signers[1])
        const userState = await genUserState(user.id, app)

        const identitySecret = user.id.secret
        const dailyEpoch = 0
        const dailyNullifier = genNullifier(user.id, dailyEpoch)

        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()
        const reputationProof = await userState.genProveReputationProof({})

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app
                .connect(notOwner)
                .claimDailyLoginRep(publicSignals, flattenedProof, identifier)
        ).to.be.reverted
    })

    it('should revert with wrong proof', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 0
        const dailyNullifier = genNullifier(user.id, dailyEpoch)

        const userState = await genUserState(user.id, app)
        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()
        const reputationProof = await userState.genProveReputationProof({})

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        flattenedProof[0] = BigInt(0)

        await expect(
            app.claimDailyLoginRep(publicSignals, flattenedProof, identifier)
        ).to.be.reverted
    })

    it('should revert when a user with rep<0 claims the login rep again within 1 day', async () => {
        await expect(
            app.claimDailyLoginRep(usedPublicSignals, usedProof, identifier)
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    it('should revert with invalid epoch', async () => {
        // elapsing 1 daily epoch
        await ethers.provider.send('evm_increaseTime', [dailyEpochLength])
        await ethers.provider.send('evm_mine', [])

        const wrongEpoch = 444

        const identitySecret = user.id.secret
        const dailyEpoch = 1
        const dailyNullifier = genNullifier(user.id, dailyEpoch)

        const userState = await genUserState(user.id, app)
        await userStateTransition(userState, unirep, app)
        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()
        const reputationProof = await userState.genProveReputationProof({})
        reputationProof.epoch = BigInt(wrongEpoch)

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimDailyLoginRep(publicSignals, flattenedProof, identifier)
        ).to.be.revertedWithCustomError(app, 'InvalidEpoch')

        userState.stop()
    })

    it('revert with positive repuation user', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 1
        const dailyNullifier = genNullifier(user.id, dailyEpoch)

        const userState = await genUserState(user.id, app)
        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()

        const reputationProof = await userState.genProveReputationProof({})

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const dailyClaimProof = new DailyClaimProof(publicSignals, proof)
        dailyClaimProof.minRep = BigInt(2)
        const controls = ReputationProof.buildControl({
            attesterId: dailyClaimProof.attesterId,
            epoch: dailyClaimProof.epoch,
            nonce: 0,
            chainId,
            minRep: dailyClaimProof.minRep,
            proveMinRep: 1,
        })
        publicSignals[1] = controls[0]
        publicSignals[2] = controls[1]

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimDailyLoginRep(publicSignals, flattenedProof, identifier)
        ).to.be.revertedWithCustomError(app, 'NonNegativeReputation')
    })

    it('should revert with invalid daily epoch', async () => {
        const identitySecret = user.id.secret
        const dailyEpoch = 2
        const dailyNullifier = genNullifier(user.id, dailyEpoch)

        const userState = await genUserState(user.id, app)
        const epoch = await userState.sync.loadCurrentEpoch()
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()

        const reputationProof = await userState.genProveReputationProof({})

        const dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        const { publicSignals, proof } = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const flattenedProof = flattenProof(proof)

        await expect(
            app.claimDailyLoginRep(publicSignals, flattenedProof, identifier)
        ).to.be.revertedWithCustomError(app, 'InvalidDailyEpoch')
    })

    it('should revert after the a user with rep<0 claim the login rep and his reputation become 0 => the user cannot claim', async () => {
        const identitySecret = user.id.secret

        let dailyEpoch = await app.dailyCurrentEpoch()
        let dailyNullifier = genNullifier(user.id, dailyEpoch)

        const userState = await genUserState(user.id, app)
        const epoch = await userState.sync.loadCurrentEpoch()
        const epochKey = genEpochKey(
            userState.id.secret,
            app.address,
            epoch,
            0,
            chainId
        )
        await app.submitAttestation(epochKey, epoch, 0, 3).then((t) => t.wait())

        await ethers.provider.send('evm_increaseTime', [epochLength])
        await ethers.provider.send('evm_mine', [])

        let toEpoch = await unirep.attesterCurrentEpoch(app.address)
        await userState.waitForSync()
        const { publicSignals, proof } =
            await userState.genUserStateTransitionProof({
                toEpoch,
            })
        await unirep
            .userStateTransition(publicSignals, proof)
            .then((t) => t.wait())

        await userState.waitForSync()
        let tree = await userState.sync.genStateTree(toEpoch, attesterId)
        let leafIndex = await userState.latestStateTreeLeafIndex(
            toEpoch,
            attesterId
        )
        let leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()

        let reputationProof = await userState.genProveReputationProof({
            maxRep: 1,
            data: data[0] - data[1],
        })

        let dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        let dailyClaimProof = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const tx = await app.claimDailyLoginRep(
            dailyClaimProof.publicSignals,
            flattenProof(dailyClaimProof.proof),
            identifier
        )
        await expect(tx)
            .to.emit(app, 'ClaimPosRep')
            .withArgs(dailyClaimProof.publicSignals[0], toEpoch)

        await userStateTransition(userState, unirep, app)

        data = await userState.getData()

        // reputation becomes 0
        expect(data[0] - data[1]).to.equal(BigInt(0))

        await ethers.provider.send('evm_increaseTime', [dailyEpochLength])
        await ethers.provider.send('evm_mine', [])
        await userStateTransition(userState, unirep, app)

        dailyEpoch = await app.dailyCurrentEpoch()
        dailyNullifier = genNullifier(user.id, dailyEpoch)
        toEpoch = await unirep.attesterCurrentEpoch(app.address)

        tree = await userState.sync.genStateTree(epoch, attesterId)
        leafIndex = await userState.latestStateTreeLeafIndex(
            toEpoch,
            attesterId
        )
        leafProof = tree.createProof(leafIndex)
        data = await userState.getData()
        data[0] = BigInt(0)

        reputationProof = await userState.genProveReputationProof({})

        dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        dailyClaimProof = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const control = ReputationProof.buildControl({
            attesterId: reputationProof.attesterId,
            epoch: reputationProof.epoch,
            nonce: reputationProof.nonce,
            revealNonce: reputationProof.revealNonce,
            chainId: reputationProof.chainId,
            proveGraffiti: reputationProof.proveGraffiti,
            minRep: BigInt(1),
            maxRep: reputationProof.maxRep,
            proveMinRep: BigInt(1),
            proveMaxRep: reputationProof.proveMaxRep,
            proveZeroRep: reputationProof.proveZeroRep,
        })

        dailyClaimProof.publicSignals[2] = control[1]

        await expect(
            app.claimDailyLoginRep(
                dailyClaimProof.publicSignals,
                flattenProof(dailyClaimProof.proof),
                identifier
            )
        ).to.be.revertedWithCustomError(app, 'NonNegativeReputation')
    })

    it('should succeed a user with rep>0 cannot claim => attest neg_rep to the user => the user can claim', async () => {
        const identitySecret = user.id.secret

        let dailyEpoch = await app.dailyCurrentEpoch()
        let dailyNullifier = genNullifier(user.id, dailyEpoch)

        const userState = await genUserState(user.id, app)
        let epoch = await userState.sync.loadCurrentEpoch()
        let tree = await userState.sync.genStateTree(epoch, attesterId)
        let leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        let leafProof = tree.createProof(leafIndex)
        let data = await userState.getData()
        data[0] = BigInt(0)

        let reputationProof = await userState.genProveReputationProof({})

        let dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        let dailyClaimProof = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const control = ReputationProof.buildControl({
            attesterId: reputationProof.attesterId,
            epoch: reputationProof.epoch,
            nonce: reputationProof.nonce,
            revealNonce: reputationProof.revealNonce,
            chainId: reputationProof.chainId,
            proveGraffiti: reputationProof.proveGraffiti,
            minRep: BigInt(1),
            maxRep: reputationProof.maxRep,
            proveMinRep: BigInt(1),
            proveMaxRep: reputationProof.proveMaxRep,
            proveZeroRep: reputationProof.proveZeroRep,
        })

        dailyClaimProof.publicSignals[2] = control[1]

        await expect(
            app.claimDailyLoginRep(
                dailyClaimProof.publicSignals,
                flattenProof(dailyClaimProof.proof),
                identifier
            )
        ).to.be.revertedWithCustomError(app, 'NonNegativeReputation')

        const epochKey = genEpochKey(
            userState.id.secret,
            app.address,
            epoch,
            0,
            chainId
        )
        await app.submitAttestation(epochKey, epoch, 1, 3).then((t) => t.wait())

        await ethers.provider.send('evm_increaseTime', [epochLength])
        await ethers.provider.send('evm_mine', [])

        let toEpoch = await unirep.attesterCurrentEpoch(app.address)
        await userState.waitForSync()
        const { publicSignals, proof } =
            await userState.genUserStateTransitionProof({
                toEpoch,
            })
        await unirep
            .userStateTransition(publicSignals, proof)
            .then((t) => t.wait())

        await userState.waitForSync()

        tree = await userState.sync.genStateTree(toEpoch, attesterId)
        leafIndex = await userState.latestStateTreeLeafIndex(
            toEpoch,
            attesterId
        )
        leafProof = tree.createProof(leafIndex)
        data = await userState.getData()

        reputationProof = await userState.genProveReputationProof({})

        dailyClaimCircuitInputs = genDailyClaimCircuitInput({
            dailyEpoch,
            dailyNullifier,
            identitySecret,
            reputationProof,
            data,
            stateTreeIndices: leafProof.pathIndices,
            stateTreeElements: leafProof.siblings,
        })

        dailyClaimProof = await genProofAndVerify(
            circuit,
            dailyClaimCircuitInputs
        )

        const tx = await app.claimDailyLoginRep(
            dailyClaimProof.publicSignals,
            flattenProof(dailyClaimProof.proof),
            identifier
        )
        await expect(tx)
            .to.emit(app, 'ClaimPosRep')
            .withArgs(dailyClaimProof.publicSignals[0], toEpoch)
    })
})
