import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { SERVER } from '../config'
import { useUser } from '@/contexts/User'
import { stringifyBigInts } from '@unirep/utils'

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

export default function useDeleteComment() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const remove = async (commentId: string, epoch: number) => {
        if (!userState) throw new Error('user state not initialized')

        const latestTransitionedEpoch =
            await userState.latestTransitionedEpoch()

        if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
            await stateTransition()
        }

        const EpochKeyLiteProof = await userState.genEpochKeyLiteProof({ epoch })       

        const data = stringifyBigInts({
            commentId,
            publicSignals: EpochKeyLiteProof.publicSignals,
            proof: EpochKeyLiteProof.proof,
        })

        const actionId = addAction(ActionType.DeleteComment, { commentId, epoch })

        try {
            const { transaction } = await deleteComment(data)
            await provider.waitForTransaction(transaction)
            await userState.waitForSync()
            await loadData(userState)
            succeedActionById(actionId)
        } catch (error) {
            console.error(error)
            failActionById(actionId)
        }
    }

    return {
        remove,
    }
}
