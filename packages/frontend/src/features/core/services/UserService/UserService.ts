import { stringifyBigInts } from '@unirep/utils'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class UserService extends RelayApiService {
    async checkIn({ identityNonce = 0 }: { identityNonce: number }) {
        const client = this.getAuthClient()

        const userState = this.getUserState()

        const { publicSignals, proof, epoch, epochKey } =
            await userState.genEpochKeyProof({
                nonce: identityNonce,
            })

        const response = await client.post(
            '/checkin',
            stringifyBigInts({
                publicSignals,
                proof,
            }),
        )

        const { txHash } = response.data
        return {
            txHash,
            epoch: Number(epoch),
            epochKey: epochKey.toString(),
        }
    }
}
