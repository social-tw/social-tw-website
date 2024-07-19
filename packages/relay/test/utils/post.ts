import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'

export async function post(
    server: ChaiHttp.Agent,
    userState: UserState,
    authentication: string,
    nonce?: number
): Promise<any> {
    const testContent = 'test content'

    const epochKeyProof = await userState.genEpochKeyProof({
        nonce: nonce ?? 0,
    })

    const res = await server
        .post('/api/post')
        .set('content-type', 'application/json')
        .set('authentication', authentication)
        .send(
            stringifyBigInts({
                content: testContent,
                publicSignals: epochKeyProof.publicSignals,
                proof: epochKeyProof.proof,
            })
        )

    expect(res).to.have.status(200)

    return res.body
}
