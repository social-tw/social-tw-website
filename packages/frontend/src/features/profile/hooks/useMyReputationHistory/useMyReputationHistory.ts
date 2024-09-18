import { QueryKeys } from '@/constants/queryKeys'
import { ReputationService, useUserState } from '@/features/core'
import {
    FromToEpoch,
    ValidFromToEpoch,
} from '@/features/shared/services/EpochDateService'
import { useQuery } from '@tanstack/react-query'

export function useMyReputationHistory(fromToEpoch: FromToEpoch) {
    const { userState } = useUserState()

    return useQuery({
        queryKey: [
            QueryKeys.ReputationHistory,
            fromToEpoch.from,
            fromToEpoch.to,
            userState?.id.toString(),
        ],
        queryFn: async () => {
            const reputationService = new ReputationService(userState)
            return reputationService.fetchMyReputationHistory(
                fromToEpoch.from,
                fromToEpoch.to,
            )
        },
        enabled: fromToEpoch instanceof ValidFromToEpoch && !!userState,
    })
}
