import { useContext } from 'react'
import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'
import { UserContext } from '../contexts/User'

export default function usePosts() {
    const userContext = useContext(UserContext)

    const randomNonce = () => Math.round(Math.random())

    const create = async (content: string) => {
        if (!userContext.userState)
            throw new Error('user state not initialized')

        if (
            userContext.userState.sync.calcCurrentEpoch() !==
            (await userContext.userState.latestTransitionedEpoch())
        ) {
            await userContext.stateTransition()
        }

        const nonce = randomNonce()
        const epochKeyProof = await userContext.userState.genEpochKeyProof({
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
        await userContext.provider.waitForTransaction(data.transaction)
        await userContext.userState.waitForSync()
        await userContext.loadData()
    }

    return { create }
}
