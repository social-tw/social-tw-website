import { ethers } from 'ethers'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import randomNonce from '@/utils/randomNonce'
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

    const create = async (content: string) => {
        if (!userState) throw new Error('user state not initialized')

        const postData = {
            postId: undefined,
            content: content,
        }
        const actionId = addAction(ActionType.Post, postData)

        try {
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()

            if (userState.sync.calcCurrentEpoch() !== latestTransitionedEpoch) {
                await stateTransition()
            }

            const nonce = randomNonce()

            const epochKey = userState
                .getEpochKeys(latestTransitionedEpoch, nonce)
                .toString()

            const epochKeyProof = await userState.genEpochKeyProof({ nonce })

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
                transactionHash: transaction,
            })

            return {
                transactionHash: transaction,
                postId,
                content,
                epoch: latestTransitionedEpoch,
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
