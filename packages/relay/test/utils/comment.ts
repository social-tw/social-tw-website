import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'

export async function comment(
    server: ChaiHttp.Agent,
    userState: UserState,
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
        .send(
            stringifyBigInts({
                content: testContent,
                postId: postId,
                publicSignals: stringifyBigInts(epochKeyProof.publicSignals),
                proof: stringifyBigInts(epochKeyProof.proof),
            })
        )
        .then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })
}
