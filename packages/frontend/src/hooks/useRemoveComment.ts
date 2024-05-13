import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'

async function deleteComment(data: string) {
    const response = await fetch(`${SERVER}/api/comment`, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    return await response.json()
}

export default function useRemoveComment() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const remove = async (
        postId: string,
        commentId: string,
        epoch: number,
        nonce: number,
    ) => {
        if (!userState) throw new Error('user state not initialized')

        const actionId = addAction(ActionType.DeleteComment, {
            postId,
            commentId,
            epoch,
        })

        try {
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()

            if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
                await stateTransition()
            }

            const EpochKeyLiteProof = await userState.genEpochKeyLiteProof({
                epoch,
                nonce,
            })

            const proof = stringifyBigInts({
                postId,
                commentId,
                publicSignals: EpochKeyLiteProof.publicSignals,
                proof: EpochKeyLiteProof.proof,
            })

            const { transaction } = await deleteComment(proof)
            await provider.waitForTransaction(transaction)
            await userState.waitForSync()
            await loadData(userState)

            succeedActionById(actionId)
        } catch {
            failActionById(actionId)
        }
    }

    return {
        remove,
    }
}
