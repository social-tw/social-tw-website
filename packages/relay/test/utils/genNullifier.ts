import { poseidon2 } from 'poseidon-lite'

export const genReportNullifier = (hashUserId: string, reportId: string) => {
    return poseidon2([hashUserId, reportId])
}
