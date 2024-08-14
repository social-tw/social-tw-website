import { Identity } from '@semaphore-protocol/identity'
import { poseidon2 } from 'poseidon-lite'

export const genReportNullifier = (identity: Identity, reportId: string) => {
    return poseidon2([identity.secret, reportId])
}
