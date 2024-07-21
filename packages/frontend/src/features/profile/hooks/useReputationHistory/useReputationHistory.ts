import { QueryKeys } from '@/constants/queryKeys'
import {
    FromToEpoch,
    ValidFromToEpoch,
} from '@/features/shared/services/EpochDateService'
import { fetchReputationHistory } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export function useReputationHistory(fromToEpoch: FromToEpoch) {
    const { isFetching: isFetchingReputationHistory, data: reputationHistory } =
        useQuery({
            queryKey: [QueryKeys.HasSignedUp, fromToEpoch.from, fromToEpoch.to],
            queryFn: async () => {
                return await fetchReputationHistory(
                    fromToEpoch.from,
                    fromToEpoch.to,
                )
            },
            enabled: fromToEpoch instanceof ValidFromToEpoch,
        })
    return {
        isFetchingReputationHistory,
        reputationHistory,
    }
}
