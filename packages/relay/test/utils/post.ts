import { UserState } from '@unirep/core'
import { expect } from 'chai'
import { stringifyBigInts } from '@unirep/utils'

export async function post(
    server: ChaiHttp.Agent,
    userState: UserState
): Promise<any> {
    const testContent = 'test content'

    const epochKeyProof = await userState.genEpochKeyProof({
        nonce: 0,
    })

    const res = await server
        .post('/api/post')
        .set('content-type', 'application/json')
        .send({
            content: testContent,
            publicSignals: stringifyBigInts(epochKeyProof.publicSignals),
            proof: stringifyBigInts(epochKeyProof.proof),
        })

    expect(res).to.have.status(200)

    return res.body
}
