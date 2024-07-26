import { UserState } from '@unirep/core'
import { ethers } from 'hardhat'
import TransactionManager from '../../src/services/utils/TransactionManager'

export async function airdropReputation(
    isPositive: boolean,
    amount: number,
    userState: UserState,
    nonce: number,
    epochLength: number
): Promise<void> {
    let epoch = await userState.sync.loadCurrentEpoch()

    const epochKeyProof = await userState.genEpochKeyProof({
        nonce,
    })

    await TransactionManager.callContract('submitAttestation', [
        epochKeyProof.epochKey,
        epoch,
        isPositive ? 0 : 1,
        amount,
    ]).then(async (txHash) => await ethers.provider.waitForTransaction(txHash))

    await ethers.provider.send('evm_increaseTime', [epochLength])
    await ethers.provider.send('evm_mine', [])
}
