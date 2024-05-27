import { useProfileHistoryStore } from '@/pages/Profile/History/store/useProfileHistoryStore'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { useEffect } from 'react'
import { SERVER } from '../config'
import { useUser } from '../contexts/User'
import client from '../socket'
import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'
import useActionCount from './useActionCount'
import { VoteAction, VoteMsg } from '@/types/Vote'
import { EpochKeyProof } from '@unirep/circuits'

export default function useVotes() {
    const { userState, loadData } = useUser()

    const invokeFetchHistoryVotesFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryVotesFlow,
    )

    const actionCount = useActionCount()

    async function create(
        _id: string,
        voteAction: VoteAction,
        epoch?: number | null,
        nonce?: number | null,
    ): Promise<boolean> {
        try {
            if (!userState) throw new Error('User state not initialized')
            let epochKeyProof: EpochKeyProof
            if (epoch != null && nonce != null) {
                epochKeyProof = await userState.genEpochKeyProof({
                    epoch: epoch,
                    nonce: nonce,
                })
            } else {
                const nowNonce = getEpochKeyNonce(actionCount)
                epochKeyProof = await userState.genEpochKeyProof({
                    nonce: nowNonce,
                })
            }
            return createVote(_id, voteAction, epochKeyProof)
        } catch (err) {
            console.error('Error when creating vote:', err)
            return false
        }
    }

    const createVote = async (
        _id: string,
        voteAction: VoteAction,
        epochKeyProof: EpochKeyProof,
    ): Promise<boolean> => {
        try {
            if (!userState) throw new Error('User state not initialized')
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
        } catch (err) {
            console.error('Error when creating vote:', err)
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
