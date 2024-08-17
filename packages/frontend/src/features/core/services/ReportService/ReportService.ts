import { RelayApiService, genReportIdentityProof } from '@/features/core'
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
        searchParams.append(
            'publicSignals',
            JSON.stringify(stringifyBigInts(publicSignals)),
        )
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
        console.time('getauth + userstate')
        const client = this.getAuthClient()

        const userState = this.getUserState()
        console.timeEnd('getauth + userstate')
        console.time('genEpochKeyProof')
        const { publicSignals, proof, epoch, epochKey } =
            await userState.genEpochKeyProof({
                nonce: identityNonce,
            })
        console.timeEnd('genEpochKeyProof')

        console.time('call relay api/report')
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
        console.timeEnd('call relay api/report')

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

        const { publicSignals, proof } = await genReportIdentityProof(
            userState,
            {
                reportId,
            },
        )

        const response = await client.post<{}>(
            `/report/${reportId}`,
            stringifyBigInts({
                adjudicateValue,
                publicSignals,
                proof,
            }),
        )
        return response.data
    }
}
