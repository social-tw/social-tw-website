import { UserState } from '@unirep/core'
import dayjs from 'dayjs'

export function formatDateByEpoch(userState: UserState, epoch: number) {
    const epochLength = userState.sync.settings.epochLength ?? 300000
    const currentEpoch = userState.sync.calcCurrentEpoch() ?? 0
    const startTimestamp = Date.now() - currentEpoch * epochLength
    const epochTimestamp = startTimestamp + epoch * epochLength
    return dayjs(epochTimestamp).format('YYYY/MM/DD')
}
