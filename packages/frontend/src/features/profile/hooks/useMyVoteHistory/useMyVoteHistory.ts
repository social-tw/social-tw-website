import { QueryKeys } from '@/constants/queryKeys'
import { VoteService, useUserState } from '@/features/core'
import {
    FromToEpoch,
    ValidFromToEpoch,
} from '@/features/shared/services/EpochDateService'
import { useQuery } from '@tanstack/react-query'

export function useMyVoteHistory(fromToEpoch: FromToEpoch) {
    const { userState } = useUserState()

    return useQuery({
        queryKey: [
            QueryKeys.VoteHistory,
            fromToEpoch.from,
            fromToEpoch.to,
            userState?.id.toString(),
        ],
        queryFn: async () => {
            const voteService = new VoteService(userState)
            return voteService.fetchMyVoteHistory(
                fromToEpoch.from,
                fromToEpoch.to,
            )
        },
        enabled: fromToEpoch instanceof ValidFromToEpoch && !!userState,
    })
}
