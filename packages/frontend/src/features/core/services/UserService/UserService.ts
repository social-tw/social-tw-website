import { stringifyBigInts } from '@unirep/utils'
import { genDailyClaimProof } from '../../utils/genDailyClaimProof'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class UserService extends RelayApiService {
    async checkIn({ identityNonce = 0 }: { identityNonce: number }) {
        const client = this.getClient()

        const userState = this.getUserState()

        const dailyEpoch = await client.get('/config').then((res) => {
            return res.data.DAILY_CURRENT_EPOCH
        })

        const dailyClaimProof = await genDailyClaimProof(userState, {
            dailyEpoch,
            epkNonce: identityNonce,
            maxRep: 1,
        })

        const response = await client.post(
            '/checkin',
            stringifyBigInts({
                publicSignals: dailyClaimProof.publicSignals,
                proof: dailyClaimProof.proof,
            }),
        )

        const { txHash } = response.data
        return {
            txHash,
            epoch: Number(dailyClaimProof.epoch),
            epochKey: dailyClaimProof.epochKey.toString(),
        }
    }
}
