import { useEffect } from 'react'
import client from '@/socket'
import { VoteMsg } from '@/types/Vote'

export function useVoteEvents(callback: (data: VoteMsg) => void) {
    useEffect(() => {
        let isMounted = true

        const handleVote = (data: VoteMsg) => {
            if (isMounted) {
                callback(data)
            }
        }

        const unsubscribe = client.onVoteEvent(handleVote)

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [callback])
}
