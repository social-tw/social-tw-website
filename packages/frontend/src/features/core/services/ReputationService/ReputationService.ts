import { FetchReputationHistoryResponse } from '@/types/api'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class ReputationService extends RelayApiService {
    async fetchReputationHistory(fromEpoch: number, toEpoch: number) {
        const client = this.getClient()
        const searchParams = new URLSearchParams()
        searchParams.append('from_epoch', fromEpoch.toString())
        searchParams.append('to_epoch', toEpoch.toString())
        const response = await client.get<FetchReputationHistoryResponse>(
            `/reputation/history?${searchParams.toString()}`,
        )
        return response.data
    }

    async fetchMyReputationHistory(fromEpoch: number, toEpoch: number) {
        const userState = this.getUserState()
        const reputationRecords = await this.fetchReputationHistory(
            fromEpoch,
            toEpoch,
        )
        return reputationRecords.filter((record) =>
            isMyEpochKey(userState, record.epoch, record.epochKey),
        )
    }
}
