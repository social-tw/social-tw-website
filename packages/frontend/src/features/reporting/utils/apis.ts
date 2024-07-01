import { SERVER } from '@/constants/config'
// TODO: Remove mock data
export async function fetchAllReports() {
    const response = await fetch(`${SERVER}/api/reports`).catch(() => ({
        ok: true,
        json() {
            // mock data
            return [
                {
                    category: 'Report',
                    reason: 'This is a report',
                    epoch: 1,
                },
            ]
        },
    }))
    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}
