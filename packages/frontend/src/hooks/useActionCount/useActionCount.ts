import { countByTimeRangeSelector, useActionStore } from '@/contexts/Actions'
import { useEpoch } from '@/hooks/useEpoch/useEpoch'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { QueryKeys } from '@/constants/queryKeys'
import { fetchCounter } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export function useActionCount() {
    const { userState } = useUserState()

    const { epochStartTime, epochEndTime } = useEpoch()

    const countOnStore = useActionStore(
        countByTimeRangeSelector(epochStartTime, epochEndTime),
    )

    const { data: count } = useQuery({
        queryKey: [QueryKeys.Counter, userState?.id.toString()],
        queryFn: async () => {
            if (!userState) return 0

            const epochKeys = userState.getEpochKeys().toString()
            const data = await fetchCounter(epochKeys)
            return data.counter
        },
    })

    const totalCount = (count ?? 0) + countOnStore

    return totalCount
}
