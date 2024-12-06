import { CHECKED_IN_AT, DISCARDED_CHECK_IN_AT } from '@/constants/config'
import { useReputationScore } from '@/features/reporting'
import { useLocalStorage } from '@uidotdev/usehooks'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'

export function useNotifyCheckIn() {
    const { reputationScore } = useReputationScore()
    const sendNotification = useSendNotification()
    const [checkedInAt, setCheckedInAt] = useLocalStorage<string | null>(
        CHECKED_IN_AT,
        null,
    )

    const [discardedAt, setDiscardedAt] = useLocalStorage<string | null>(
        DISCARDED_CHECK_IN_AT,
        null,
    )

    const isOpen =
        !!reputationScore && reputationScore < 0 && !checkedInAt && !discardedAt

    const startCheckIn = () => {
        setCheckedInAt(new Date().toISOString())
    }

    const failCheckIn = () => {
        setCheckedInAt(null)
    }

    const discardCheckIn = () => {
        setDiscardedAt(new Date().toISOString())
    }

    useEffect(() => {
        if (!checkedInAt || dayjs().isSame(dayjs(checkedInAt), 'day')) {
            return
        }

        setCheckedInAt(null)
    }, [checkedInAt, setCheckedInAt])

    useEffect(() => {
        if (!discardedAt || dayjs().isSame(dayjs(discardedAt), 'day')) {
            return
        }

        setDiscardedAt(null)
    }, [discardedAt, setDiscardedAt])

    useEffect(() => {
        if (
            !!reputationScore &&
            reputationScore < 0 &&
            !checkedInAt &&
            !discardedAt
        ) {
            sendNotification(NotificationType.LOW_REPUTATION)
        }
    }, [reputationScore, checkedInAt, discardedAt])

    return {
        isOpen,
        startCheckIn,
        failCheckIn,
        discardCheckIn,
    }
}
