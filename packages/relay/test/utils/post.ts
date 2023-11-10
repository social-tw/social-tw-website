import { UserState } from '@unirep/core'
import { HTTP_SERVER } from '../configs'
import { stringifyBigInts } from '@unirep/utils'

export async function post(userState: UserState): Promise<any> {
    const testContent = 'test content'

    const epochKeyProof = await userState.genEpochKeyProof({
        nonce: 0,
    })

    const res: any = await fetch(`${HTTP_SERVER}/api/post`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                content: testContent,
                publicSignals: epochKeyProof.publicSignals,
                proof: epochKeyProof.proof,
            }),
        ),
    }).then((r) => {
        return r.json()
    })

    return res
}
