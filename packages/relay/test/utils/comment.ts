import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'

export async function comment(
    server: ChaiHttp.Agent,
    userState: UserState,
    authentication: string,
    postId: string,
    nonce: number
): Promise<any> {
    const testContent = 'test content'

    const epochKeyProof = await userState.genEpochKeyProof({
        nonce,
    })

    return await server
        .post('/api/comment')
        .set('content-type', 'application/json')
        .set('authentication', authentication)
        .send(
            stringifyBigInts({
                content: testContent,
                postId: postId,
                publicSignals: epochKeyProof.publicSignals,
                proof: epochKeyProof.proof,
            })
        )
        .then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })
}
