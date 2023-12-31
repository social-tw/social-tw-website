import { useState } from 'react'
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

export default function useDeleteComment() {
    const { userState, stateTransition, provider, loadData } = useUser()
    const [isDeleted, setIsDeleted] = useState(false)

    const genProof = async (epoch: number, transactionHash: string) => {
        if (!userState) throw new Error('user state not initialized')

        const latestTransitionedEpoch =
            await userState.latestTransitionedEpoch()

        if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
            await stateTransition()
        }

        const EpochKeyLiteProof = await userState.genEpochKeyLiteProof({
            epoch,
        })

        const proof = stringifyBigInts({
            transactionHash,
            publicSignals: EpochKeyLiteProof.publicSignals,
            proof: EpochKeyLiteProof.proof,
        })

        return proof
    }

    const remove = async (
        proof: string,
        epoch: number,
        transactionHash: string,
    ) => {
        if (!userState) throw new Error('user state not initialized')
        const actionId = addAction(ActionType.DeleteComment, {
            epoch,
            transactionHash,
        })

        try {
            const { transaction } = await deleteComment(proof)
            await provider.waitForTransaction(transaction)
            await userState.waitForSync()
            await loadData(userState)
            succeedActionById(actionId)
            setIsDeleted(true)
        } catch {
            failActionById(actionId)
        }
    }

    return {
        genProof,
        remove,
        isDeleted,
    }
}
