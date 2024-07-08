// @ts-ignore
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployApp } from '../scripts/utils/deployUnirepSocialTw'
import { Unirep, UnirepApp } from '../typechain-types'
import { IdentityObject } from './types'
import { createRandomUserIdentity, genUserState } from './utils'

describe('Claim Report Positive Reputation Test', function () {
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

    before(async function () {
        try {
            const [deployer] = await ethers.getSigners()
            const contracts = await deployApp(deployer, epochLength)
            unirep = contracts.unirep
            app = contracts.app

            user = createRandomUserIdentity()

            chainId = await unirep.chainid()

            const userState = await genUserState(user.id, app)
            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            await app.userSignUp(publicSignals, proof, user.hashUserId, false)
            await app
                .userRegistry(user.hashUserId)
                .then((res) => expect(res).to.be.true)
            console.log('user register success...')
            userState.stop()
        } catch (err) {
            console.error(err)
        }
    })

    it('should claim daily login reputation', async () => {})
    it('should revert with wrong proof', async () => {})
    it('should revert with invalid epoch', async () => {})
})
