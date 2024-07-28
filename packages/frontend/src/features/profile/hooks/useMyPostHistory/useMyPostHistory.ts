import { QueryKeys } from '@/constants/queryKeys'
import { PostService, useUserState } from '@/features/core'
import {
    FromToEpoch,
    ValidFromToEpoch,
} from '@/features/shared/services/EpochDateService'
import { useQuery } from '@tanstack/react-query'

export function useMyPostHistory(fromToEpoch: FromToEpoch) {
    const { userState } = useUserState()

    return useQuery({
        queryKey: [
            QueryKeys.PostHistory,
            fromToEpoch.from,
            fromToEpoch.to,
            userState?.id.toString(),
        ],
        queryFn: async () => {
            const postService = new PostService(userState)
            return postService.fetchMyPostHistory(
                fromToEpoch.from,
                fromToEpoch.to,
            )
        },
        enabled: fromToEpoch instanceof ValidFromToEpoch && !!userState,
    })
}
