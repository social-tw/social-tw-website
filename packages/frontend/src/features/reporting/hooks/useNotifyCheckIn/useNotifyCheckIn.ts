import { useReputationScore } from '@/features/reporting'
import { useLocalStorage } from '@uidotdev/usehooks'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'

const DISCARDED_AT = 'discarded-checkin-at'

export function useNotifyCheckIn() {
    const { data: score } = useReputationScore()

    const [discardedAt, saveDiscardedAt] = useLocalStorage<string | null>(
        DISCARDED_AT,
        null,
    )

    const isOpen = useMemo(
        () => !!score && score < 0 && !discardedAt,
        [score, discardedAt],
    )

    const discard = () => {
        saveDiscardedAt(new Date().toISOString())
    }

    useEffect(() => {
        if (!discardedAt || dayjs().isSame(dayjs(discardedAt), 'day')) {
            return
        }

        saveDiscardedAt(null)
    }, [discardedAt, saveDiscardedAt])

    return {
        isOpen,
        discard,
    }
}
