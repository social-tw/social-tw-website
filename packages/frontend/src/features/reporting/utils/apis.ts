import { SERVER } from '@/constants/config'
import { stringifyBigInts } from '@unirep/utils'
import { ReportHistory } from './types'

export async function fetchPendingReports(): Promise<ReportHistory[]> {
    const response = await fetch(`${SERVER}/api/report?status=0`)

    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export async function adjudicateReport({
    reportId,
    nullifier,
    adjudicateValue,
}: {
    reportId: string
    nullifier: bigint
    adjudicateValue: number
}) {
    const response = await fetch(`${SERVER}/api/report/${reportId}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                nullifier,
                adjudicateValue,
            }),
        ),
    })

    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }

    return data
}
