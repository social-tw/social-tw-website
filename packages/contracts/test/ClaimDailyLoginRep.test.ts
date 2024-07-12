// @ts-ignore
import { Circuit } from '@unirep/circuits'
import { deployVerifierHelper } from '@unirep/contracts/deploy/index.js'
import { genEpochKey } from '@unirep/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import {
    createRandomUserIdentity,
    genEpochKeyLiteProof,
    genUserState,
} from './utils'

const checkSignals = (signals, proof) => {
    expect(signals.epochKey.toString()).equal(proof.epochKey.toString())
    expect(signals.stateTreeRoot.toString()).equal(
        proof.stateTreeRoot.toString()
    )
    expect(signals.nonce.toString()).equal(proof.nonce.toString())
    expect(signals.epoch.toString()).equal(proof.epoch.toString())
    expect(signals.attesterId.toString()).equal(proof.attesterId.toString())
    expect(signals.revealNonce).equal(Boolean(proof.revealNonce))
    expect(signals.chainId.toString()).equal(proof.chainId.toString())
    expect(signals.minRep.toString()).equal(proof.minRep.toString())
    expect(signals.maxRep.toString()).equal(proof.maxRep.toString())
    expect(signals.proveMinRep).equal(Boolean(proof.proveMinRep))
    expect(signals.proveMaxRep).equal(Boolean(proof.proveMaxRep))
    expect(signals.proveZeroRep).equal(Boolean(proof.proveZeroRep))
    expect(signals.proveGraffiti).equal(Boolean(proof.proveGraffiti))
    expect(signals.graffiti.toString()).equal(proof.graffiti.toString())
    expect(signals.data.toString()).equal(proof.data.toString())
}

describe('Claim Daily Login Reputation Test', function () {
    this.timeout(1000000)
    let unirep: Unirep
    let app: UnirepApp
    let repVerifierHelper
    let chainId: number
    let user: IdentityObject

    let snapshot: any
    const epochLength = 300

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

            repVerifierHelper = await deployVerifierHelper(
                unirep.address,
                deployer,
                Circuit.reputation
            )

            user = createRandomUserIdentity()

            chainId = await unirep.chainid()

            const userState = await genUserState(user.id, app)

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
                .submitAttestation(epochKey, epoch, 0, 5)
                .then((t) => t.wait())

            // setting negRep to 10
            await app
                .submitAttestation(epochKey, epoch, 1, 10)
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

            const signals = await repVerifierHelper.verifyAndCheck(
                proof.publicSignals,
                proof.proof
            )
            checkSignals(signals, proof)

            userState.stop()
        } catch (err) {
            console.error(err)
        }
    })

    it('should claim daily login reputation', async () => {
        const userState = await genUserState(user.id, app)

        const currentEpoch = await userState.sync.loadCurrentEpoch()

        const { publicSignals, proof } = await userState.genEpochKeyLiteProof()

        const tx = await app.claimDailyLoginRep(publicSignals, proof)
        await expect(tx)
            .to.emit(app, 'ClaimPosRep')
            .withArgs(publicSignals[1], currentEpoch)
    })

    it('should revert with wrong proof', async () => {
        const userState = await genUserState(user.id, app)

        const { publicSignals, proof } = await userState.genEpochKeyLiteProof()

        proof[0] = BigInt(0)

        await expect(app.claimDailyLoginRep(publicSignals, proof)).to.be
            .reverted
    })

    it('should revert with invalid epoch', async () => {
        const nonce = 0
        const attesterId = BigInt(app.address)
        const userState = await genUserState(user.id, app)
        const wrongEpoch = 444

        const { publicSignals, proof } = await genEpochKeyLiteProof({
            id: user.id,
            epoch: wrongEpoch,
            nonce,
            attesterId,
            chainId,
        })

        await expect(
            app.claimDailyLoginRep(publicSignals, proof)
        ).to.be.revertedWithCustomError(app, 'InvalidEpoch')

        userState.stop()
    })
})
