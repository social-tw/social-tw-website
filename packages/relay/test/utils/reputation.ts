import { Unirep } from '@unirep-app/contracts/typechain-types'
import { UserState } from '@unirep/core'
import TransactionManager from '../../src/services/utils/TransactionManager'
import { userStateTransition } from './genProof'

export async function airdropReputation(
    isPositive: boolean,
    amount: number,
    userState: UserState,
    unirep: Unirep,
    express: any,
    provider: any,
): Promise<void> {
    const epoch = await userState.sync.loadCurrentEpoch()

    const epochKeyProof = await userState.genEpochKeyProof()

    await TransactionManager.callContract('submitAttestation', [
        epochKeyProof.epochKey,
        epoch,
        isPositive ? 0 : 1,
        amount,
    ]).then(async (txHash) => await provider.waitForTransaction(txHash))
    await userState.waitForSync()

    await userStateTransition(userState, {
        express,
        unirep,
    })
}
