import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { SERVER } from '../config'
import { useUser } from '@/contexts/User'
import randomNonce from '@/utils/randomNonce'
import { stringifyBigInts } from '@unirep/utils'

async function publishComment(data: string) {
    const response = await fetch(`${SERVER}/api/comment`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    return await response.json()
}

export default function useCreateComment() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const create = async (postId: string, content: string, onCloseAnimation: () => void) => {
        if (!userState) throw new Error('user state not initialized')

        const latestTransitionedEpoch =
            await userState.latestTransitionedEpoch()

        if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
            await stateTransition()
        }

        const nonce = randomNonce()
        const epochKeyProof = await userState.genEpochKeyProof({ nonce })

        const data = stringifyBigInts({
            content,
            postId,
            publicSignals: epochKeyProof.publicSignals,
            proof: epochKeyProof.proof,
        })

        const actionId = addAction(ActionType.Comment, data)
        // TODO: seperate the functions
        onCloseAnimation()

        try {
            const { transaction } = await publishComment(data)
            await provider.waitForTransaction(transaction)
            await userState.waitForSync()
            await loadData(userState)
            // TODO: fix the commentId redirection
            succeedActionById(actionId, { commentId: "Tocheck" })
        } catch (error) {
            console.error(error)
            failActionById(actionId)
        }
    }

    return {
        create,
    }
}
