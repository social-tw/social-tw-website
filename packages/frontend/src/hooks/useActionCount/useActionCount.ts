import { countByTimeRangeSelector, useActionStore } from '@/contexts/Actions'
import { useEpoch } from '@/hooks/useEpoch/useEpoch'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { QueryKeys } from '@/constants/queryKeys'
import { fetchCounter } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export function useActionCount() {
    const { userState } = useUserState()

    const { currentEpoch, epochLength, epochEndTime } = useEpoch()

    
    const { data: counter } = useQuery({
        queryKey: [QueryKeys.Counter, userState?.id?.toString(), currentEpoch],
        queryFn: async () => {
            if (!userState) {
                return { time: 0, count: 0 }
            }
            
            const epochKeys = userState.getEpochKeys().toString()
            const data = await fetchCounter(epochKeys)
            return {
                time: Date.now(),
                count: data.counter,
            }
        },
        staleTime: epochLength
    })

    const startTime = counter?.time ?? 0
    
    const countOnStore = useActionStore(
        countByTimeRangeSelector(startTime, epochEndTime),
    )

    const totalCount = (counter?.count ?? 0) + countOnStore

    return totalCount
}
