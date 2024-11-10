import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { jsonToBase64 } from '../../src/middlewares/CheckReputationMiddleware'

export const genAuthentication = async (userState: UserState) => {
    const { publicSignals, _snarkProof: proof } =
        await userState.genProveReputationProof({})

    return jsonToBase64(
        stringifyBigInts({
            publicSignals,
            proof,
        }),
    )
}
