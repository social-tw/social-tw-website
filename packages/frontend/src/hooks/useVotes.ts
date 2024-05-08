import { useProfileHistoryStore } from '@/pages/Profile/History/store/useProfileHistoryStore'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { useEffect } from 'react'
import { SERVER } from '../config'
import { useUser } from '../contexts/User'
import client from '../socket'
import { VoteAction, VoteMsg } from '../types'

export default function useVotes() {
    const { userState, loadData } = useUser()
    const invokeFetchHistoryVotesFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryVotesFlow,
    )

    const randomNonce = () => Math.round(Math.random())

    const create = async (
        _id: string,
        voteAction: VoteAction,
    ): Promise<boolean> => {
        try {
            if (!userState) throw new Error('User state not initialized')

            const nonce = randomNonce()

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

            await loadData(userState)

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

export const useVoteEvents = (callback: any) => {
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
