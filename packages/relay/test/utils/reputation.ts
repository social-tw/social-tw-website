import { Unirep, UnirepApp } from '@unirep-app/contracts/typechain-types'
import { UserState } from '@unirep/core'
import TransactionManager from '../../src/services/utils/TransactionManager'

export async function airdropReputation(
    isPositive: boolean,
    amount: number,
    userState: UserState,
    unirep: Unirep,
    app: UnirepApp,
    provider: any,
    epochLength: number
): Promise<void> {
    const epoch = await userState.sync.loadCurrentEpoch()

    const epochKeyProof = await userState.genEpochKeyProof()

    await TransactionManager.callContract('submitAttestation', [
        epochKeyProof.epochKey,
        epoch,
        isPositive ? 0 : 1,
        amount,
    ]).then(async (txHash) => await provider.waitForTransaction(txHash))
    await provider.send('evm_increaseTime', [epochLength])
    await provider.send('evm_mine', [])

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
}
