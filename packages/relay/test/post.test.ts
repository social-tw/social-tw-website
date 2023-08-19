import { ethers } from 'hardhat'
import { expect } from 'chai'
import { stringifyBigInts } from '@unirep/utils'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

//TODO:
// happy path:
// - setup server
// - register
// - post
// [ ] verify post
// [ ] verify transaction
// [ ] fetch post-90
// should fail:
// - post with wrong proof

beforeEach(async () => {
    const { unirep, app } = await deployContracts()
    await startServer(unirep, app)
})

describe('POST /post', () => {
    it('should create a post', async () => {
        const res = await fetch(`${HTTP_SERVER}/api/post`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: 'content',
                    publicSignals: 'epochKeyProof.publicSignals',
                    proof: 'epochKeyProof.proof',
                })
            ),
        }).then((r) => r.json())
        console.log(res)
        //expect(res.status).equal(200)
        //expect(res.body).('postId')
    })
})
