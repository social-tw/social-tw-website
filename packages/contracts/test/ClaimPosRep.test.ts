// @ts-ignore
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createRandomUserIdentity,
    genEpochKeyProof,
    genUserState,
    randomData,
} from './utils'

describe('Claim Positive Reputation Test', function () {
    this.timeout(1000000)
    let unirep: Unirep
    let app: UnirepApp
    let chainId: number
    let user: IdentityObject

    let snapshot: any
    const epochLength = 300
    const posReputation = 3
    let usedPublicSig: any
    let usedProof: any

    {
        before(async function () {
            snapshot = await ethers.provider.send('evm_snapshot', [])
        })
        after(async function () {
            await ethers.provider.send('evm_revert', [snapshot])
        })
    }

    before(async () => {
        const [deployer] = await ethers.getSigners()
        const contracts = await deployApp(deployer, epochLength)
        unirep = contracts.unirep
        app = contracts.app

        user = createRandomUserIdentity()

        chainId = await unirep.chainid()

        const userState = await genUserState(user.id, app)
        const { publicSignals, proof } = await userState.genUserSignUpProof()
        await app.userSignUp(publicSignals, proof, user.hashUserId, false)
        await app
            .userRegistry(user.hashUserId)
            .then((res) => expect(res).to.be.true)
        userState.stop()
    })
    it('should succeed with valid inputs (correct epochKey, epoch, etc)', async () => {
        const userState = await genUserState(user.id, app)
        const { publicSignals, proof } = await userState.genEpochKeyProof({
            nonce: 0,
        })
        const epoch = await userState.sync.loadCurrentEpoch()

        usedPublicSig = publicSignals
        usedProof = proof

        const tx = await app.claimReportPosRep(
            publicSignals,
            proof,
            posReputation
        )
        await expect(tx)
            .to.emit(app, 'ClaimPosRep')
            .withArgs(publicSignals[0], epoch)

        userState.stop()
    })

    it('should revert with used epochKeyProof ProofHasUsed', async () => {
        await expect(
            app.claimReportPosRep(usedPublicSig, usedProof, posReputation)
        ).to.be.revertedWithCustomError(app, 'ProofHasUsed')
    })

    it('should revert with wrong epochKeyProof', async () => {
        const userState = await genUserState(user.id, app)
        const { publicSignals, proof } = await userState.genEpochKeyProof({
            nonce: 0,
        })
        proof[0] = BigInt(0)

        await expect(app.claimReportPosRep(publicSignals, proof, posReputation))
            .to.be.reverted

        userState.stop()
    })

    it('should revert with wrong epoch', async () => {
        const userState = await genUserState(user.id, app)
        const id = user.id
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
            app.claimReportPosRep(publicSignals, proof, posReputation)
        ).to.be.revertedWithCustomError(app, 'InvalidEpoch')

        userState.stop()
    })

    it('should revert with wrong attester InvalidAttester', async () => {
        const userState = await genUserState(user.id, app)
        const id = user.id
        const attesterId = userState.sync.attesterId
        const wrongAttester = BigInt(44444)
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
            epoch,
            nonce: 0,
            chainId,
            attesterId: wrongAttester,
            data,
        })

        await expect(app.claimReportPosRep(publicSignals, proof, posReputation))
            .to.be.reverted

        userState.stop()
    })
})
