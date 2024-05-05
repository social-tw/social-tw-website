import { ethers } from 'ethers'
import {
    ActionType,
    addAction,
    failActionById,
    PostData,
    succeedActionById,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import useActionCount from '@/hooks/useActionCount'
import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'
import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'

async function publishPost(data: string) {
    const response = await fetch(`${SERVER}/api/post`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    return await response.json()
}

export default function useCreatePost() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const actionCount = useActionCount()

    const create = async (content: string) => {
        if (!userState) throw new Error('user state not initialized')

        const postData: PostData = {
            postId: undefined,
            content: content,
            epochKey: undefined,
            transactionHash: undefined,
        }
        const actionId = addAction(ActionType.Post, postData)

        try {
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()

            if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
                await stateTransition()
            }

            const nonce = getEpochKeyNonce(actionCount)

            const epochKeyProof = await userState.genEpochKeyProof({
                nonce,
            })

            const epoch = Number(epochKeyProof.epoch)
            const epochKey = epochKeyProof.epochKey.toString()

            const proof = stringifyBigInts({
                content,
                publicSignals: epochKeyProof.publicSignals,
                proof: epochKeyProof.proof,
            })

            const { transaction } = await publishPost(proof)
            const receipt = await provider.waitForTransaction(transaction)
            const postId = ethers.BigNumber.from(
                receipt.logs[0].topics[2],
            ).toString()

            await userState.waitForSync()
            await loadData(userState)

            succeedActionById(actionId, {
                postId,
                epochKey,
                transactionHash: transaction,
            })

            return {
                transactionHash: transaction,
                postId,
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
