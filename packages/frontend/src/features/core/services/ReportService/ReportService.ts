import { RelayApiService, genReportIdentityProof } from '@/features/core'
import { RelayCreateReportResponse } from '@/types/api'
import {
    RelayRawReportCategory,
    ReportHistory,
    ReportStatus,
    ReportType,
} from '@/types/Report'
import { stringifyBigInts } from '@unirep/utils'

export class ReportService extends RelayApiService {
    async fetchPendingReports() {
        const client = this.getClient()

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
        postId,
        reason,
        category,
        identityNonce,
    }: {
        type: ReportType
        objectId: string
        postId? : string
        reason: string
        category: number
        identityNonce: number
    }) {
        const client = this.getClient()

        const userState = this.getUserState()
        const { publicSignals, proof, epoch, epochKey } =
            await userState.genProveReputationProof({
                epkNonce: identityNonce,
                minRep: 0,
            })

        const response = await client.post<RelayCreateReportResponse>(
            '/report',
            stringifyBigInts({
                _reportData: {
                    type,
                    objectId,
                    postId: postId ?? "",
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

    async fetchWaitFotTransactionReports() {
        const client = this.getClient()
        const userState = this.getUserState()
        const { publicSignals, proof } = await userState.genEpochKeyLiteProof()

        const searchParams = new URLSearchParams()
        searchParams.append(
            'status',
            ReportStatus.WAITING_FOR_TRANSACTION.toString(),
        )
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

    async fetchReportById(reportId: string) {
        const client = this.getClient()
        const userState = this.getUserState()
        const { publicSignals, proof } = await userState.genEpochKeyLiteProof()

        const searchParams = new URLSearchParams()
        searchParams.append(
            'publicSignals',
            JSON.stringify(stringifyBigInts(publicSignals)),
        )
        searchParams.append('proof', JSON.stringify(stringifyBigInts(proof)))

        const response = await client.get<ReportHistory>(
            `/report/${reportId}?${searchParams.toString()}`,
        )
        return response.data
    }
}
