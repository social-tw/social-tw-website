import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { SERVER } from '../config'
import { useUser } from '@/contexts/User'
import { stringifyBigInts } from '@unirep/utils'
import { useState } from 'react'

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
    const [isDeleted, setIsDeleted] = useState(false)

    const genProof = async (commentId: string, epoch: number) => {
        if (!userState) throw new Error('user state not initialized')

        const latestTransitionedEpoch =
            await userState.latestTransitionedEpoch()

        if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
            await stateTransition()
        }

        const EpochKeyLiteProof = await userState.genEpochKeyLiteProof({ epoch })       

        const proof = stringifyBigInts({
            commentId,
            publicSignals: EpochKeyLiteProof.publicSignals,
            proof: EpochKeyLiteProof.proof,
        })

        return proof
    }

    const remove = async(proof: string, commentId: string, epoch: number) => {
        if (!userState) throw new Error('user state not initialized')
        const actionId = addAction(ActionType.DeleteComment, { commentId, epoch })

        try {
            const { transaction } = await deleteComment(proof)
            await provider.waitForTransaction(transaction)
            await userState.waitForSync()
            await loadData(userState)
            succeedActionById(actionId)
            setIsDeleted(true)
        } catch (error) {
            console.error(error)
            failActionById(actionId)
        }
    }

    return {
        genProof,
        remove,
        isDeleted,
    }
}
