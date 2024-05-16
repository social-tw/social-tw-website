import { ethers } from 'ethers'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'
import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'
import useActionCount from './useActionCount'

async function publishComment(values: unknown) {
    const response = await fetch(`${SERVER}/api/comment`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(values),
    })
    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export default function useCreateComment() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const actionCount = useActionCount()

    const create = async (postId: string, content: string) => {
        if (!userState) throw new Error('user state not initialized')

        const commentData = {
            commentId: undefined,
            postId: postId,
            content: content,
            epoch: undefined,
            transactionHash: undefined,
        }
        const actionId = addAction(ActionType.Comment, commentData)

        try {
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()

            if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
                await stateTransition()
            }

            const nonce = getEpochKeyNonce(actionCount)

            const epochKeyProof = await userState.genEpochKeyProof({ nonce })
            const epoch = Number(epochKeyProof.epoch)

            const epochKey = epochKeyProof.epochKey.toString()

            const proof = stringifyBigInts({
                content,
                postId,
                publicSignals: epochKeyProof.publicSignals,
                proof: epochKeyProof.proof,
            })

            const { txHash } = await publishComment(proof)
            const receipt = await provider.waitForTransaction(txHash)
            const commentId = ethers.BigNumber.from(
                receipt.logs[0].topics[3],
            ).toString()

            await userState.waitForSync()
            await loadData(userState)

            succeedActionById(actionId, {
                commentId,
                epoch,
                epochKey,
                transactionHash: txHash,
            })

            return {
                transactionHash: txHash,
                postId,
                commentId,
                content,
                epoch,
                epochKey,
            }
        } catch (error) {
            failActionById(actionId)
            throw error
        }
    }

    return {
        create,
    }
}
