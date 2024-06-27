import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import nock from 'nock'
import { Synchronizer } from '@unirep/core'
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_KEY } from '../src/config'
import { TransactionManager } from '../src/services/utils/TransactionManager'
import { userService } from '../src/services/UserService'
import { UserRegisterStatus } from '../src/types'
import { CLIENT_URL } from './configs'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'

const TWITTER_API = 'https://api.twitter.com'
const mockState = 'state'
const mockCode = 'testCode'
const mockUserId = '123456'
const mockUserId2 = '654321'
const wrongCode = 'wrong-code'
const wrongCommitment = BigInt(0)
const token = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_KEY}`)

describe('LOGIN /login', function () {
    let snapshot: any
    let anondb: DB
    let tm: TransactionManager
    let express: ChaiHttp.Agent
    let sync: Synchronizer
    let userStateFactory: UserStateFactory

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const {
            db,
            prover,
            provider,
            TransactionManager,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, app)

        anondb = db
        tm = TransactionManager
        express = chaiServer
        sync = synchronizer
        userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app,
            synchronizer
        )
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
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            anondb,
            mockUserId,
            'access-token'
        )

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
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            anondb,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(
            user,
            undefined,
            false
        )
        await userStateFactory.initUserState(userState)
        const { signupProof, publicSignals } = await userStateFactory.genProof(
            userState
        )
        publicSignals[0] = wrongCommitment.toString()
        await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: signupProof._snarkProof,
                hashUserId: user.hashUserId,
                token: user.token,
                fromServer: true,
            })
            .then((res) => {
                expect(res).to.have.status(400)
            })

        userState.stop()
    })

    it('/api/signup, user sign up with wallet', async function () {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            anondb,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(
            user,
            tm.wallet,
            false
        )
        await userStateFactory.initUserState(userState)
        const { signupProof, publicSignals } = await userStateFactory.genProof(
            userState
        )

        const txHash = await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: signupProof._snarkProof,
                hashUserId: user.hashUserId,
                token: user.token,
                fromServer: false,
            })
            .then((res) => {
                expect(res.body.status).to.equal('success')
                expect(res.body.txHash).to.be.not.null
                expect(res).to.have.status(200)
                return res.body.txHash
            })
        await ethers.provider.waitForTransaction(txHash)

        await userState.waitForSync()
        await sync.waitForSync()
        userState.stop()
    })

    it('/api/signup, sign up with the same commitment', async function () {
        // prepare the same commitment of using wallet sign up
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            anondb,
            mockUserId,
            'access-token'
        )

        const userState = await userStateFactory.createUserState(
            user,
            tm.wallet,
            false
        )
        await userStateFactory.initUserState(userState)
        const { publicSignals, signupProof } = await userStateFactory.genProof(
            userState
        )

        await expect(
            userService.signup(
                publicSignals,
                signupProof._snarkProof,
                user.hashUserId,
                true,
                this.synchronizer
            )
        ).to.be.rejectedWith(Error)

        userState.stop()
    })

    it('/api/signup, sign up with different attesterId', async function () {
        prepareUserLoginTwitterApiMock(mockUserId2, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            anondb,
            mockUserId2,
            'access-token'
        )

        const userState = await userStateFactory.createUserState(
            user,
            undefined,
            false
        )
        await userStateFactory.initUserState(userState)
        const { publicSignals, signupProof } = await userStateFactory.genProof(
            userState
        )

        const anotherAppAddress = ethers.Wallet.createRandom().address
        const wrongControl =
            BigInt(anotherAppAddress) +
            (BigInt(2) ^ BigInt(160)) * signupProof.epoch
        publicSignals[2] = wrongControl.toString()

        await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: signupProof._snarkProof,
                hashUserId: user.hashUserId,
                token: user.token,
                fromServer: true,
            })
            .then((res) => {
                expect(res).to.have.status(400)
            })
        userState.stop()
    })

    it('/api/signup, user sign up with server', async function () {
        prepareUserLoginTwitterApiMock(mockUserId2, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            anondb,
            mockUserId2,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(
            user,
            undefined,
            false
        )
        await userStateFactory.initUserState(userState)
        const { signupProof, publicSignals } = await userStateFactory.genProof(
            userState
        )

        const txHash = await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: signupProof._snarkProof,
                hashUserId: user.hashUserId,
                token: user.token,
                fromServer: true,
            })
            .then((res) => {
                expect(res.body.status).to.equal('success')
                expect(res.body.txHash).to.be.not.null
                expect(res).to.have.status(200)
                return res.body.txHash
            })
        await ethers.provider.waitForTransaction(txHash)

        await userState.waitForSync()
        await sync.waitForSync()
        userState.stop()
    })

    it('/api/signup, handle duplicate signup', async function () {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            anondb,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(
            user,
            undefined,
            false
        )
        await userStateFactory.initUserState(userState)
        const { publicSignals, signupProof } = await userStateFactory.genProof(
            userState
        )

        await express
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: signupProof._snarkProof,
                hashUserId: user.hashUserId,
                token: user.token,
                fromServer: true,
            })
            .then((res) => {
                expect(res).to.have.status(400)
            })

        userState.stop()
    })

    it('/api/login, registered user with own wallet', async function () {
        const registeredUser = await userService.getLoginUser(
            anondb,
            mockUserId,
            'access-token'
        )
        expect(registeredUser.status).to.equal(UserRegisterStatus.REGISTERER)
    })

    it('/api/login, registered user with server wallet', async function () {
        const registeredUser = await userService.getLoginUser(
            anondb,
            mockUserId2,
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
