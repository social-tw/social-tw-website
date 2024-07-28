import { QueryKeys } from '@/constants/queryKeys'
import { CommentService, useUserState } from '@/features/core'
import {
    FromToEpoch,
    ValidFromToEpoch,
} from '@/features/shared/services/EpochDateService'
import { useQuery } from '@tanstack/react-query'

export function useMyCommentHistory(fromToEpoch: FromToEpoch) {
    const { userState } = useUserState()

    return useQuery({
        queryKey: [
            QueryKeys.CommentHistory,
            fromToEpoch.from,
            fromToEpoch.to,
            userState?.id.toString(),
        ],
        queryFn: async () => {
            const commentService = new CommentService(userState)
            return commentService.fetchMyCommentHistory(
                fromToEpoch.from,
                fromToEpoch.to,
            )
        },
        enabled: fromToEpoch instanceof ValidFromToEpoch && !!userState,
    })
}
