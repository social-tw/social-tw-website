import { RelayApiService } from '@/features/core'
import { getAdjudicateNullifier } from '@/features/reporting/utils/helpers'
import { ReportHistory } from '@/features/reporting/utils/types'
import { RelayCreateReportResponse } from '@/types/api'
import {
    RelayRawReportCategory,
    ReportCategory,
    ReportType,
} from '@/types/Report'
import { stringifyBigInts } from '@unirep/utils'

export class ReportService extends RelayApiService {
    async fetchPendingReports() {
        const client = this.getAuthClient()

        const userState = this.getUserState()
        const { publicSignals, proof } = await userState.genEpochKeyLiteProof()

        const searchParams = new URLSearchParams()
        searchParams.append('status', '0')
        searchParams.append('publicSignals', JSON.stringify(stringifyBigInts(publicSignals)))
        searchParams.append('proof', JSON.stringify(stringifyBigInts(proof)))
        const response = await client.get<ReportHistory[]>(
            `/report?${searchParams.toString()}`,
        )

        return response.data
    }

    async fetchReportCategories() {
        const client = this.getClient()
        const response = await client.get<RelayRawReportCategory[]>(
            `/report/category`,
        )
        return response.data
    }

    async createReport({
        type,
        objectId,
        reason,
        category,
        identityNonce,
    }: {
        type: ReportType
        objectId: string
        reason: string
        category: ReportCategory
        identityNonce: number
    }) {
        const client = this.getAuthClient()

        const userState = this.getUserState()
        const { publicSignals, proof, epoch, epochKey } =
            await userState.genEpochKeyProof({
                nonce: identityNonce,
            })

        const response = await client.post<RelayCreateReportResponse>(
            '/report',
            stringifyBigInts({
                _reportData: {
                    type,
                    objectId,
                    reason,
                    category,
                    reportEpoch: Number(epoch),
                    reportorEpochKey: epochKey.toString(),
                },
                publicSignals,
                proof,
            }),
        )

        return {
            reportId: response.data.reportId,
            epoch: Number(epoch),
            epochKey: epochKey.toString(),
        }
    }

    async adjudicateReport({
        reportId,
        adjudicateValue,
    }: {
        reportId: string
        adjudicateValue: number
    }) {
        const client = this.getAuthClient()
        const userState = this.getUserState()
        const nullifier = getAdjudicateNullifier(userState.id.secret, reportId)
        const response = await client.post<{}>(
            `/report/${reportId}`,
            stringifyBigInts({
                nullifier,
                adjudicateValue,
            }),
        )
        return response.data
    }
}
