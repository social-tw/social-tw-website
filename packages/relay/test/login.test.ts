import chai from 'chai'
import chaiHttp from 'chai-http'
import { expect } from 'chai'
import * as chaiAsPromise from 'chai-as-promised'
import nock from 'nock'
import { deployContracts, startServer } from './environment'
import { userService } from '../src/services/UserService'
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_KEY } from '../src/config'
import { UserRegisterStatus } from '../src/enums/userRegisterStatus'
import { HTTP_SERVER, CLIENT_URL } from './configs'
import { ethers } from 'hardhat'
import { Server } from 'http'
import { Contract, providers } from 'ethers'
import { UserStateFactory } from './utils/UserStateFactory'
import { DB } from 'anondb'
import { Prover } from '@unirep/circuits'
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import { TransactionManager } from '../src/singletons/TransactionManager'

chai.use(chaiHttp)

const TWITTER_API = 'https://api.twitter.com'
const mockState = 'state'
const mockCode = 'testCode'
const mockUserId = '123456'
const wrongCode = 'wrong-code'
const token = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_KEY}`)

describe('LOGIN /login', () => {
    let snapshot: any
    let app: Contract
    let unirep: Contract
    let db: DB
    let prover: Prover
    let provider: providers.JsonRpcProvider
    let TransactionManager: TransactionManager
    let synchronizer: UnirepSocialSynchronizer
    let server: Server
    let userStateFactory: UserStateFactory

    beforeEach(async () => {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // open promise testing
        chai.use(chaiAsPromise.default)
        // deploy contracts
        ;({ unirep, app } = await deployContracts())
        // start server
        ;({ db, prover, provider, TransactionManager, synchronizer, server } =
            await startServer(unirep, app))

        userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app
        )
    })

    afterEach(async () => {
        await ethers.provider.send('evm_revert', [snapshot])
        server.close()
    })

    it('/api/login, return url', async () => {
        await chai
            .request(`${HTTP_SERVER}`)
            .get('/api/login')
            .then((res) => {
                expect(res.body.url).to.be.not.null
                expect(res).to.have.status(200)
            })
    })

    it('/api/user, init user with wrong code and return error', async () => {
        // Suppress console.error and restore original console.error
        const originalConsoleError = console.error
        console.log = console.error = console.warn = () => {}

        // mock with wrong code response
        nock(TWITTER_API, { encodedQueryParams: true })
            .post('/2/oauth2/token')
            .query({
                code: wrongCode,
                grant_type: 'authorization_code',
                client_id: TWITTER_CLIENT_ID,
                redirect_uri: /^.*$/,
            })
            .matchHeader('content-type', 'application/x-www-form-urlencoded')
            .matchHeader('authorization', `Basic ${token}`)
            .reply(400, {
                error: 'invalid_request',
                error_description:
                    'Value passed for the authorization code was invalid.',
            })

        nock(`${CLIENT_URL}`)
            .get('/')
            .query({
                error: 'apiError',
            })
            .reply(200)

        await chai
            .request(`${HTTP_SERVER}`)
            .get('/api/user')
            .set('content-type', 'application/json')
            .query({
                state: mockState,
                code: wrongCode,
            })
            .then((res) => {
                expect(res).to.have.status(200)
            })

        console.error = originalConsoleError
    })

    it('/api/user, init user', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )

        nock(`${CLIENT_URL}`)
            .get('/login')
            .query({
                code: user.hashUserId,
                status: user.status,
                token: user.token,
                signMsg: user.signMsg,
            })
            .reply(200)

        await chai
            .request(`${HTTP_SERVER}`)
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

    it('/api/signup, user sign up with wallet', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(
            user,
            TransactionManager.wallet
        )
        await userState.sync.start()
        await userState.waitForSync()

        const signupProof = await userState.genUserSignUpProof()
        const publicSignals = signupProof.publicSignals.map((n) => n.toString())

        await chai
            .request(`${HTTP_SERVER}`)
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
                expect(res.body.hash).to.be.not.null
                expect(res).to.have.status(200)
            })
    })

    it('/api/signup, user sign up with server', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(user)
        await userState.sync.start()
        await userState.waitForSync()

        const signupProof = await userState.genUserSignUpProof()
        const publicSignals = signupProof.publicSignals.map((item) =>
            item.toString()
        )
        const proof = signupProof.proof.map((item) => item.toString())

        await chai
            .request(`${HTTP_SERVER}`)
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: proof,
                hashUserId: user.hashUserId,
                token: user.token,
                fromServer: true,
            })
            .then((res) => {
                expect(res.body.status).to.equal('success')
                expect(res.body.hash).to.be.not.null
                expect(res).to.have.status(200)
            })
    })

    it('/api/signup, user not sign up with wrong proof and return error', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(user)
        await userState.sync.start()
        await userState.waitForSync()

        let wrongSignupProof = await userState.genUserSignUpProof()
        const publicSignals = wrongSignupProof.publicSignals.map((n) =>
            n.toString()
        )
        wrongSignupProof.identityCommitment = BigInt(0)

        await chai
            .request(`${HTTP_SERVER}`)
            .post('/api/signup')
            .set('content-type', 'application/json')
            .query({
                publicSignals: publicSignals,
                proof: wrongSignupProof,
                hashUserId: user.hashUserId,
                token: user.token,
                fromServer: true,
            })
            .then((res) => {
                expect(res).to.have.status(500)
            })
    })

    it('/api/signup, handle duplicate signup', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(user)
        await userState.sync.start()
        await userState.waitForSync()

        let signupProof = await userState.genUserSignUpProof()
        let publicSignals = signupProof.publicSignals.map((n) => n.toString())

        await chai
            .request(`${HTTP_SERVER}`)
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
                expect(res.body.hash).to.be.not.null
                expect(res).to.have.status(200)
            })

        // signup again with the same hash user id
        await userState.waitForSync()
        signupProof = await userState.genUserSignUpProof()
        publicSignals = signupProof.publicSignals.map((n) => n.toString())

        await chai
            .request(`${HTTP_SERVER}`)
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
    })

    it('/api/login, registered user with own wallet', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(
            user,
            TransactionManager.wallet
        )
        await userState.sync.start()
        await userState.waitForSync()

        const signupProof = await userState.genUserSignUpProof()
        const publicSignals = signupProof.publicSignals.map((n) => n.toString())

        await chai
            .request(`${HTTP_SERVER}`)
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
                expect(res.body.hash).to.be.not.null
                expect(res).to.have.status(200)
            })
            .catch(async (err) => {
                // 0x53d3ff53 means wrong epoch
                if (err.message.includes('0x53d3ff53')) {
                    await chai
                        .request(`${HTTP_SERVER}`)
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
                            expect(res.body.hash).to.be.not.null
                            expect(res).to.have.status(200)
                        })
                } else {
                    console.log(err.message)
                }
            })

        await synchronizer.waitForSync()
        const registeredUser = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )
        expect(registeredUser.status).to.equal(UserRegisterStatus.REGISTERER)
    })

    it('/api/login, registered user with server wallet', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        const user = await userService.getLoginUser(
            db,
            mockUserId,
            'access-token'
        )
        const userState = await userStateFactory.createUserState(user)
        await userState.sync.start()
        await userState.waitForSync()

        const signupProof = await userState.genUserSignUpProof()
        const publicSignals = signupProof.publicSignals.map((n) => n.toString())

        await chai
            .request(`${HTTP_SERVER}`)
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
                expect(res.body.hash).to.be.not.null
                expect(res).to.have.status(200)
            })
            .catch(async (err) => {
                // 0x53d3ff53 means wrong epoch
                if (err.message.includes('0x53d3ff53')) {
                    await chai
                        .request(`${HTTP_SERVER}`)
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
                            expect(res.body.hash).to.be.not.null
                            expect(res).to.have.status(200)
                        })
                } else {
                    console.log(err.message)
                }
            })

        await synchronizer.waitForSync()
        const registeredUser = await userService.getLoginUser(
            db,
            mockUserId,
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
