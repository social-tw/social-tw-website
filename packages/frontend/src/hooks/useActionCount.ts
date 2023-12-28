import { useEffect, useMemo, useState } from 'react'
import { SERVER } from '@/config'
import { countByTimeRangeSelector, useActionStore } from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import useEpoch from './useEpoch'

export default function useActionCount() {
    const { userState } = useUser()

    const { epochStartTime, epochEndTime } = useEpoch()

    const countOnStore = useActionStore(
        countByTimeRangeSelector(epochStartTime, epochEndTime),
    )
    const [count, setCount] = useState(0)

    useEffect(() => {
        async function load() {
            if (!userState) return

            const epochKeys = userState.getEpochKeys().toString()
            const epks = epochKeys.replaceAll(',', '_')

            const params = new URLSearchParams()
            params.append('epks', epks)

            const response = await fetch(
                `${SERVER}/api/counter?${params.toString()}`,
            )
            const data = await response.json()

            setCount(data.counter)
        }

        load()
    }, [userState])

    const totalCount = useMemo(
        () => count + countOnStore,
        [count, countOnStore],
    )

    return totalCount
}
