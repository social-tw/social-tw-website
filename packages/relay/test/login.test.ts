import { Identity } from '@semaphore-protocol/identity'
import { UnirepApp } from '@unirep-app/contracts/typechain-types'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import nock from 'nock'
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_KEY } from '../src/config'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { userService } from '../src/services/UserService'
import { UserRegisterStatus } from '../src/types'
import { CLIENT_URL } from './configs'
import { deployContracts, startServer, stopServer } from './environment'
import { IdentityObject } from './utils/types'
import { createUserIdentities, genUserState } from './utils/userHelper'

const TWITTER_API = 'https://api.twitter.com'
const mockState = 'state'
const mockCode = 'testCode'
const wrongCode = 'wrong-code'
const wrongCommitment = BigInt(0)
const token = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_KEY}`)

describe('LOGIN /login', function () {
    let snapshot: any
    let db: DB
    let express: ChaiHttp.Agent
    let sync: UnirepSocialSynchronizer
    let prover: any
    let app: UnirepApp
    let users: IdentityObject[]
    let provider: any

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // deploy contracts
        const { unirep, app: _app } = await deployContracts(100000)
        // start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, _app)

        db = _db
        express = chaiServer
        sync = synchronizer
        prover = _prover
        app = _app
        provider = _provider

        users = createUserIdentities(2)
    })

    afterEach(async function () {
        nock.cleanAll()
    })

    after(async function () {
        await stopServer('login', snapshot, sync, express)
    })

    it('/api/login, return url', async function () {
        await express.get('/api/login').then((res) => {
            expect(res.body.url).to.be.not.null
            expect(res).to.have.status(200)
        })
    })

    it('/api/user, init user with wrong code and return error', async function () {
        // mock with wrong code response
        nock(TWITTER_API, { encodedQueryParams: true })
            .post('/2/oauth2/token')
            .query({
                code: wrongCode,
                grant_type: 'authorization_code',
                client_id: TWITTER_CLIENT_ID,
                redirect_uri: /^.*$/,
                code_verifier: /^.*$/,
            })
            .matchHeader('content-type', 'application/x-www-form-urlencoded')
            .matchHeader('authorization', `Basic ${token}`)
            .reply(400, {
                error: 'invalid_request',
                error_description:
                    'Value passed for the authorization code was invalid.',
            })

        nock(`${CLIENT_URL}`)
            .get('/login')
            .query({
                error: 'apiError',
            })
            .reply(200)

        await express
            .get('/api/user')
            .set('content-type', 'application/json')
            .query({
                state: mockState,
                code: wrongCode,
            })
            .then((res) => {
                expect(res).to.have.status(200)
            })
    })

    it('/api/user, init user', async function () {
        const userId = users[0].id.toString()
        prepareUserLoginTwitterApiMock(userId, mockCode, 'access-token')
        const user = await userService.getLoginUser(db, userId, 'access-token')

        nock(`${CLIENT_URL}`)
            .get('/twitter/callback')
            .query({
                code: user.hashUserId,
                status: user.status,
                token: user.token,
                signMsg: user.signMsg,
            })
            .reply(200)

        await express
            .get('/api/user')
            .set('content-type', 'application/json')
            .query({
                state: mockState,
                code: mockCode,
            })
            .then((res) => {
                expect(res).to.have.status(200)
            })
    })

    it('/api/signup, user sign up with wrong proof and return error', async function () {
        const userId = users[0].id.toString()
        prepareUserLoginTwitterApiMock(userId, mockCode, 'access-token')
        const user = await userService.getLoginUser(db, userId, 'access-token')
        const identity = new Identity(user.hashUserId)
        const userState = await genUserState(identity, sync, app, db, prover)
        const { publicSignals, _snarkProof: proof } =
            await userState.genUserSignUpProof()

        publicSignals[0] = wrongCommitment

        await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals: publicSignals,
                    proof,
                    hashUserId: user.hashUserId,
                    token: user.token,
                    fromServer: true,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
            })
    })

    it('/api/signup, user sign up with wallet', async function () {
        const userId = users[0].id.toString()
        prepareUserLoginTwitterApiMock(userId, mockCode, 'access-token')
        const user = await userService.getLoginUser(db, userId, 'access-token')
        const userState = await genUserState(users[0].id, sync, app, db, prover)
        const { publicSignals, _snarkProof: proof } =
            await userState.genUserSignUpProof()

        const txHash = await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals,
                    proof,
                    hashUserId: user.hashUserId,
                    token: user.token,
                    fromServer: false,
                })
            )
            .then((res) => {
                expect(res.body.status).to.equal('success')
                expect(res.body.txHash).to.be.not.null
                expect(res).to.have.status(200)
                return res.body.txHash
            })
        await provider.waitForTransaction(txHash)
        await sync.waitForSync()
    })

    it('/api/signup, sign up with the same commitment', async function () {
        const userId = users[0].id.toString()
        // prepare the same commitment of using wallet sign up
        prepareUserLoginTwitterApiMock(userId, mockCode, 'access-token')
        const user = await userService.getLoginUser(db, userId, 'access-token')

        const userState = await genUserState(users[0].id, sync, app, db, prover)
        const { publicSignals, _snarkProof: proof } =
            await userState.genUserSignUpProof()

        await expect(
            userService.signup(
                stringifyBigInts(publicSignals),
                proof,
                user.hashUserId,
                true,
                this.synchronizer
            )
        ).to.be.rejectedWith(Error)
    })

    it('/api/signup, sign up with different attesterId', async function () {
        const userId = users[1].id.toString()
        prepareUserLoginTwitterApiMock(userId, mockCode, 'access-token')
        const user = await userService.getLoginUser(db, userId, 'access-token')

        const userState = await genUserState(users[1].id, sync, app, db, prover)
        const {
            publicSignals,
            _snarkProof: proof,
            epoch,
        } = await userState.genUserSignUpProof()

        const anotherAppAddress = ethers.Wallet.createRandom().address
        const wrongControl =
            BigInt(anotherAppAddress) + (BigInt(2) ^ BigInt(160)) * epoch
        publicSignals[2] = wrongControl

        await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals: publicSignals,
                    proof: proof,
                    hashUserId: user.hashUserId,
                    token: user.token,
                    fromServer: true,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
            })
    })

    it('/api/signup, user sign up with server', async function () {
        const userId = users[1].id.toString()
        prepareUserLoginTwitterApiMock(userId, mockCode, 'access-token')
        const user = await userService.getLoginUser(db, userId, 'access-token')
        const userState = await genUserState(users[1].id, sync, app, db, prover)
        const { publicSignals, _snarkProof: proof } =
            await userState.genUserSignUpProof()

        const txHash = await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals: publicSignals,
                    proof: proof,
                    hashUserId: user.hashUserId,
                    token: user.token,
                    fromServer: true,
                })
            )
            .then((res) => {
                expect(res.body.status).to.equal('success')
                expect(res.body.txHash).to.be.not.null
                expect(res).to.have.status(200)
                return res.body.txHash
            })
        await provider.waitForTransaction(txHash)
        await sync.waitForSync()
    })

    it('/api/signup, handle duplicate signup', async function () {
        const userId = users[0].id.toString()
        prepareUserLoginTwitterApiMock(userId, mockCode, 'access-token')
        const user = await userService.getLoginUser(db, userId, 'access-token')
        const userState = await genUserState(users[0].id, sync, app, db, prover)
        const { publicSignals, _snarkProof: proof } =
            await userState.genUserSignUpProof()

        await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    publicSignals,
                    proof,
                    hashUserId: user.hashUserId,
                    token: user.token,
                    fromServer: true,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
            })
    })

    it('/api/login, registered user with own wallet', async function () {
        const userId = users[0].id.toString()
        const registeredUser = await userService.getLoginUser(
            db,
            userId,
            'access-token'
        )
        expect(registeredUser.status).to.equal(UserRegisterStatus.REGISTERER)
    })

    it('/api/login, registered user with server wallet', async function () {
        const userId = users[1].id.toString()
        const registeredUser = await userService.getLoginUser(
            db,
            userId,
            'access-token'
        )
        expect(registeredUser.status).to.equal(
            UserRegisterStatus.REGISTERER_SERVER
        )
    })
})

function prepareUserLoginTwitterApiMock(
    userId: string,
    code: string,
    accessToken: string
) {
    nock(TWITTER_API, { encodedQueryParams: true })
        .post('/2/oauth2/token')
        .query({
            code: code,
            grant_type: 'authorization_code',
            code_verifier: /^.*$/,
            client_id: TWITTER_CLIENT_ID,
            redirect_uri: /^.*$/,
        })
        .matchHeader('content-type', 'application/x-www-form-urlencoded')
        .matchHeader('authorization', `Basic ${token}`)
        .reply(200, {
            token_type: 'bearer',
            refresh_token: 'mock-refresh-token',
            access_token: accessToken,
        })

    nock(TWITTER_API)
        .post('/2/oauth2/token')
        .query({
            client_id: TWITTER_CLIENT_ID,
            grant_type: 'refresh_token',
            refresh_token: 'mock-refresh-token',
        })
        .matchHeader('Content-type', 'application/x-www-form-urlencoded')
        .matchHeader('Authorization', `Basic ${token}`)
        .reply(200, {
            access_token: accessToken,
        })

    nock(TWITTER_API, { encodedQueryParams: true })
        .get('/2/users/me')
        .matchHeader('Authorization', `Bearer ${accessToken}`)
        .reply(200, {
            data: {
                id: userId,
                name: 'SocialTWDev',
                username: 'SocialTWDev',
            },
        })
}
