import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'

export async function post(
    server: ChaiHttp.Agent,
    userState: UserState,
    nonce?: number
): Promise<any> {
    const testContent = 'test content'

    const repProof = await userState.genProveReputationProof({
        epkNonce: nonce ?? 0,
    })

    const res = await server
        .post('/api/post')
        .set('content-type', 'application/json')
        .send(
            stringifyBigInts({
                content: testContent,
                publicSignals: repProof.publicSignals,
                proof: repProof.proof,
            })
        )

    expect(res).to.have.status(200)

    return res.body.txHash
}
