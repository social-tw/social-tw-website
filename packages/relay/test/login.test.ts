import * as crypto from 'crypto'
import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import nock from 'nock'
import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

let userState: UserState

describe('LOGIN /login', () => {
    let unirep, app;
    let db, prover, provider, TransactionManager;
    beforeEach(async () => {
        // deploy contracts
        ({ unirep, app } = await deployContracts());
        // start server
        ({ db, prover, provider, TransactionManager } = await startServer(
            unirep,
            app
        ));
    })


    /* it('/api/login should response 200', async () => {
        const response = (await fetch(`${HTTP_SERVER}/api/login`, {
            method: 'GET',
        }))
        expect(response.status).equal(200)
    }) */

    /* it('/api/user should catch redirection', async () => {
        // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
        const mockState = 'state'
        const mockCode = 'VGNibzFWSWREZm01bjN1N3dicWlNUG1oa2xRRVNNdmVHelJGY2hPWGxNd2dxOjE2MjIxNjA4MjU4MjU6MToxOmFjOjE'
        nock('http://api.twitter.com')
            .post('/2/oauth2/token')
            .reply(200, { access_token: 'test_token' })
        const response = (await fetch(`${HTTP_SERVER}/api/user?state=${mockState}&code=${mockCode}`, {
            method: 'GET',
        }))
        expect(response.status).equal(200)        
    }) */

    it('/api/signup should generate proof and signup', async () => {
        
    })

    // TODO
    //it('should post failed with wrong proof', async () => {})
})
