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
        console.log(epoch)

        const latestTransitionedEpoch =
            await userState.latestTransitionedEpoch()

        if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
            await stateTransition()
        }

        console.log(userState.sync.calcCurrentEpoch())

        const nonce = randomNonce()
        const EpochKeyLiteProof = await userState.genEpochKeyLiteProof({ epoch, nonce })
        console.log(EpochKeyLiteProof)

        const data = stringifyBigInts({
            commentId,
            publicSignals: EpochKeyLiteProof.publicSignals,
            proof: EpochKeyLiteProof.proof,
        })

        console.log(data)

        // const actionId = addAction(ActionType.Comment, data)

        try {
            const { transaction } = await deleteComment(data)
            await provider.waitForTransaction(transaction)
            await userState.waitForSync()
            await loadData(userState)
            // succeedActionById(actionId, { id: comment?.id })
        } catch (error) {
            console.error(error)
            // failActionById(actionId)
        }
    }

    return {
        remove,
    }
}
