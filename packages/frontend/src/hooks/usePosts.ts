import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'
import { useUser } from '../contexts/User'

export default function usePosts() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const randomNonce = () => Math.round(Math.random())

    const create = async (content: string) => {
        if (!userState) throw new Error('user state not initialized')

        if (
            userState.sync.calcCurrentEpoch() !==
            (await userState.latestTransitionedEpoch())
        ) {
            await stateTransition()
        }

        const nonce = randomNonce()
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })
        const data = await fetch(`${SERVER}/api/post`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => r.json())
        await provider.waitForTransaction(data.transaction)
        await userState.waitForSync()
        await loadData(userState)
    }

    return { create }
}
