import * as crypto from 'crypto'
import * as chai from "chai";
import { expect } from "chai";
import * as chaiAsPromise from 'chai-as-promised'
import nock from 'nock'
import { deployContracts, startServer } from './environment'
import { userService } from '../src/services/UserService'
import { CALLBACK_URL, TWITTER_CLIENT_ID, TWITTER_CLIENT_KEY } from '../src/config'
import { UserRegisterStatus } from '../src/enums/userRegisterStatus'

const TWITTER_API = "https://api.twitter.com"

describe('LOGIN /login', () => {

    const mockState = 'state'
    const mockCode = 'testCode'
    const mockUserId = '123456'
    const token = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_KEY}`)

    before(async () => {
        // open promise testing 
        chai.use(chaiAsPromise.default)
        // deploy contracts
        const { unirep, app } = await deployContracts()
        // start server
        await startServer(unirep, app)
    })

    beforeEach(async () => {
        // mock twitter api behavior
        const accessToken = "test_access_token"
        nock(TWITTER_API, { "encodedQueryParams": true })
            .post('/2/oauth2/token')
            .query({
                "code": mockCode,
                "grant_type": "authorization_code",
                "client_id": TWITTER_CLIENT_ID,
                "redirect_uri": CALLBACK_URL
            })
            .matchHeader('Content-type', 'application/x-www-form-urlencoded')
            .matchHeader('Authorization', `Basic ${token}`)
            .reply(200, {
                "token_type": "bearer",
                "refresh_token": 'mock-refresh-token',
                "access_token": accessToken
            });
        nock(TWITTER_API)
            .post('/2/oauth2/token')
            .query({
                client_id: TWITTER_CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: 'mock-refresh-token'
            })
            .matchHeader('Content-type', 'application/x-www-form-urlencoded')
            .matchHeader('Authorization', `Basic ${token}`)
            .reply(200, {
                "access_token": accessToken
            });
        nock(TWITTER_API, { "encodedQueryParams": true })
            .get('/2/users/me')
            .matchHeader('Authorization', `Bearer ${accessToken}`)
            .reply(200, {
                "data": {
                    "id": mockUserId,
                    "name": "SocialTWDev",
                    "username": "SocialTWDev"
                }
            });
    })

    it('init user with wrong code', async () => {
        const wrongCode = "wrong-code"
        nock(TWITTER_API, { "encodedQueryParams": true })
            .post('/2/oauth2/token')
            .query({
                "code": wrongCode,
                "grant_type": "authorization_code",
                "client_id": TWITTER_CLIENT_ID,
                "redirect_uri": CALLBACK_URL
            })
            .matchHeader('Content-type', 'application/x-www-form-urlencoded')
            .matchHeader('Authorization', `Basic ${token}`)
            .reply(400, {
                "error": "invalid_request",
                "error_description": "Value passed for the authorization code was invalid."
            });

        await expect(userService.loginOrInitUser(mockState, wrongCode))
            .to.be.rejectedWith(`Error in login`)
    })

    it('init user', async () => {

        // since redirect is hard to test so change to use service
        const user = await userService.loginOrInitUser(mockState, mockCode)

        const hash = crypto.createHash('sha3-224')
        const expectedUserId = `0x${hash.update(mockUserId).digest('hex')}`

        expect(user.hashUserId).equal(expectedUserId)
        expect(user.status).equal(UserRegisterStatus.INIT)
        expect(user.signMsg).equal(undefined)
    })

    it('sign up user', async () => {

    })

    // it('/api/user catch redirection and response 200 when user registered', async () => {
    // it('/api/user catch redirection and response 200 when user has registered', async () => {')


    /* it('/api/signup should generate proof and signup', async () => {
        
    }) */

    // TODO
    //it('should post failed with wrong proof', async () => {})

    after(async () => {
        // stop the server for next testing
    })
})
