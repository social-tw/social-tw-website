import { SERVER } from '@/constants/config'
import { RelayRawReportCategory } from '@/types/Report'

// TODO: Remove mock data
export async function fetchAllReports() {
    const response = await fetch(`${SERVER}/api/reports`)

    // mock data
    const data = (await response.json()) ?? [
        {
            category: 'Report',
            reason: 'This is a report',
            epoch: 1,
        },
    ]

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export async function fetchReportCategories(): Promise<
    RelayRawReportCategory[]
> {
    const response = await fetch(`${SERVER}/api/report/category`)
    const data = await response.json()
    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}
