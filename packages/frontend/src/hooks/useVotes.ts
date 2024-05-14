import { useProfileHistoryStore } from '@/pages/Profile/History/store/useProfileHistoryStore'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { useEffect } from 'react'
import { SERVER } from '../config'
import client from '../socket'
import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'
import { VoteAction, VoteMsg } from '@/types/Vote'
import { useActionCount } from './useActionCount'
import { useUserState } from './useUserState'

export default function useVotes() {
    const { userState } = useUserState()

    const invokeFetchHistoryVotesFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryVotesFlow,
    )

    const actionCount = useActionCount()

    const create = async (
        _id: string,
        voteAction: VoteAction,
    ): Promise<boolean> => {
        try {
            if (!userState) throw new Error('User state not initialized')

            const nonce = getEpochKeyNonce(actionCount)

            const epochKeyProof = await userState.genEpochKeyProof({ nonce })

            const response = await fetch(`${SERVER}/api/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    stringifyBigInts({
                        postId: _id,
                        voteAction,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    }),
                ),
            })
            await userState.waitForSync()

            await invokeFetchHistoryVotesFlow(userState as unknown as UserState)

            if (response.status === 201) {
                return true
            } else {
                throw new Error(
                    `Vote failed with status: ${await response.json()}`,
                )
            }
        } catch (error) {
            return false
        }
    }

    return { create }
}

export const useVoteEvents = (callback: (data: VoteMsg) => void) => {
    useEffect(() => {
        let isMounted = true

        const handleVote = (data: VoteMsg) => {
            if (isMounted) {
                callback(data)
            }
        }

        client.onVoteEvent(handleVote)

        return () => {
            isMounted = false
        }
    }, [callback])
}
