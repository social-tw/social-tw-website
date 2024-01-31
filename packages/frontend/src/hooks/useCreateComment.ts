import { ethers } from 'ethers'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'

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

    const genProof = async (postId: string, content: string) => {
        if (!userState) throw new Error('user state not initialized')

        const latestTransitionedEpoch =
            await userState.latestTransitionedEpoch()

        if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
            await stateTransition()
        }

        // TODO: What is nonce doing and how it should be set
        const epochKeyProof = await userState.genEpochKeyProof()

        const proof = stringifyBigInts({
            content,
            postId,
            publicSignals: epochKeyProof.publicSignals,
            proof: epochKeyProof.proof,
        })

        return {
            proof,
            epoch: latestTransitionedEpoch,
        }
    }

    const create = async (
        proof: string,
        postId: string,
        content: string,
        epoch: number,
    ) => {
        if (!userState) throw new Error('user state not initialized')
        const commentData = {
            commentId: 'notGetYet',
            postId: postId,
            content: content,
            epoch,
            transactionHash: '',
        }
        const actionId = addAction(ActionType.Comment, commentData)

        try {
            const { transaction } = await publishComment(proof)
            const receipt = await provider.waitForTransaction(transaction)
            const commentId = ethers.BigNumber.from(
                receipt.logs[0].topics[3],
            ).toString()
            await userState.waitForSync()
            await loadData(userState)
            succeedActionById(actionId, {
                commentId,
                transactionHash: transaction,
            })
        } catch {
            failActionById(actionId)
        }
    }

    return {
        genProof,
        create,
    }
}
