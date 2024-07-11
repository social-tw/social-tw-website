import { Identity } from '@semaphore-protocol/identity'
import crypto from 'crypto'
import { poseidon2 } from 'poseidon-lite'

export const genReportNullifier = (objectId: string) => {
    const hash = crypto.createHash('sha3-224')
    const hashUserId = `0x${hash
        .update(new Identity().toString())
        .digest('hex')}` as string
    return poseidon2([hashUserId, objectId])
}
