import { stringifyBigInts } from '@unirep/utils'
import { SERVER } from '../config'
import { useUser } from '../contexts/User'
import { VoteAction, VoteMsg } from '../types'
import { useEffect } from 'react'
import client from '../socket'

export default function useVotes() {
    const { userState, provider, loadData } = useUser()

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
                        _id,
                        voteAction,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    }),
                ),
            })
            await userState.waitForSync()

            await loadData(userState)

            if (response.status === 201) {
                console.log('Vote succeeded!')
                return true
            } else {
                throw new Error(
                    `Vote failed with status: ${await response.json()}`,
                )
            }
        } catch (error) {
            console.error('Vote failed:', error)
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
