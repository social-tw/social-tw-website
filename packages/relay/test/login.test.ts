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
//nock.recorder.rec();
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

    it('/api/user should catch redirection', async () => {
        // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
        const mockState = 'state'
        const mockCode = 'VGNibzFWSWREZm01bjN1N3dicWlNUG1oa2xRRVNNdmVHelJGY2hPWGxNd2dxOjE2MjIxNjA4MjU4MjU6MToxOmFjOjE'
        nock('https://api.twitter.com', {"encodedQueryParams":true})
            .post('/2/oauth2/token')
            .query({
                "code":"VGNibzFWSWREZm01bjN1N3dicWlNUG1oa2xRRVNNdmVHelJGY2hPWGxNd2dxOjE2MjIxNjA4MjU4MjU6MToxOmFjOjE",
                "grant_type":"authorization_code",
                "client_id":"eDlSQVpZVFlRUmNLa0VMR3NhbTA6MTpjaQ",
                "redirect_uri":"http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fuser"
            })
            .matchHeader('Content-type', 'application/x-www-form-urlencoded')
            .matchHeader('Authorization', 'Basic ZURsU1FWcFpWRmxSVW1OTGEwVk1SM05oYlRBNk1UcGphUTpGVnpkalhjMW5Tdlh5UnFwYkduVWJrbko3cEF2cFpDZHlvMVRqNTBPaDZ4Z3NTTFFRQg==')
            .reply(200, {
                "token_type":"bearer",
                "refresh_token": 'mock-refresh-token',
                "access_token":"AAAA%2FAAA%3DAAAAAAAAxxxxxx"
            });
        nock('https://api.twitter.com')
            .post('/2/oauth2/token')
            .query({
              client_id: 'eDlSQVpZVFlRUmNLa0VMR3NhbTA6MTpjaQ',
              grant_type: 'refresh_token',
              refresh_token: 'mock-refresh-token'
            })
            .matchHeader('Content-type', 'application/x-www-form-urlencoded')
            .matchHeader('Authorization', 'Basic ZURsU1FWcFpWRmxSVW1OTGEwVk1SM05oYlRBNk1UcGphUTpGVnpkalhjMW5Tdlh5UnFwYkduVWJrbko3cEF2cFpDZHlvMVRqNTBPaDZ4Z3NTTFFRQg==')
            .reply(200,{
                "access_token":"AAAA%2FAAA%3DAAAAAAAAxxxxxx"
            });          
        nock('https://api.twitter.com', {"encodedQueryParams":true})
            .get('/2/users/me')
            .reply(200,{
                "data": {
                  "id": "2244994945",
                  "name": "SocialTWDev",
                  "username": "SocialTW Dev"
                }
            });
        const response = (await fetch(`${HTTP_SERVER}/api/user?state=${mockState}&code=${mockCode}`, {
            method: 'GET',
        }))
        expect(response.status).equal(200)        
    })

    /* it('/api/signup should generate proof and signup', async () => {
        
    }) */

    // TODO
    //it('should post failed with wrong proof', async () => {})
})
