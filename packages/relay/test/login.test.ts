import * as crypto from 'crypto'
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
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { Server } from 'http'

chai.use(chaiHttp)

const TWITTER_API = 'https://api.twitter.com'
const mockState = 'state'
const mockCode = 'testCode'
const mockCode2 = 'testCode2'
const mockUserId = '123456'
const mockUserId2 = '654321'
const wrongCode = 'wrong-code'
const token = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_KEY}`)

describe('LOGIN /login', () => {
    let snapshot: any
    let userState: UserState
    let app, unirep
    let db, prover, provider, TransactionManager, synchronizer
    let server: Server
    let hashMockUserId: string
    let hashMockUserId2: string

    before(async () => {
        snapshot = await ethers.provider.send('evm_snapshot', [])

        // open promise testing
        chai.use(chaiAsPromise.default)
        // deploy contracts
        ;({ unirep, app } = await deployContracts())
        // start server
        ;({ db, prover, provider, TransactionManager, synchronizer, server } =
            await startServer(unirep, app))

        const hash = crypto.createHash('sha3-224')
        hashMockUserId = `0x${hash.update(mockUserId).digest('hex')}`
        const hash2 = crypto.createHash('sha3-224')
        hashMockUserId2 = `0x${hash2.update(mockUserId2).digest('hex')}`
    })

    after(async () => {
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

        nock(`${CLIENT_URL}`)
            .get('/login')
            .query({
                code: hashMockUserId,
                status: `${UserRegisterStatus.INIT}`,
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

    it('/api/identity, before wallet sign up and after init user', async () => {
        const wallet = TransactionManager.wallet!!
        const expectedSignMsg = await wallet.signMessage(hashMockUserId)

        await chai
            .request(`${HTTP_SERVER}`)
            .post('/api/identity')
            .set('content-type', 'application/json')
            .send({
                hashUserId: hashMockUserId,
            })
            .then((res) => {
                expect(res.body.signMsg).to.equal(expectedSignMsg)
                expect(res).to.have.status(200)
            })
    })

    it('/api/signup, user sign up with wallet', async () => {
        // TODO: encapsulate below to a function within original code
        const wallet = TransactionManager.wallet
        const signature = await wallet.signMessage(hashMockUserId)
        const identity = new Identity(signature)
        userState = new UserState({
            db,
            provider,
            prover,
            unirepAddress: unirep.address,
            attesterId: BigInt(app.address),
            id: identity,
        })
        await userState.sync.start()
        await userState.waitForSync()
        const signupProof = await userState.genUserSignUpProof()
        var publicSignals = signupProof.publicSignals.map((n) => n.toString())

        await chai
            .request(`${HTTP_SERVER}`)
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: signupProof._snarkProof,
                hashUserId: hashMockUserId,
                fromServer: false,
            })
            .then((res) => {
                expect(res.body.status).to.equal('success')
                expect(res.body.hash).to.be.not.null
                expect(res).to.have.status(200)
            })
    })

    it('/api/signup, user sign up with server', async () => {
        const res = await userService.getLoginOrInitUser(mockUserId2)
        expect(res.hashUserId).to.equal(hashMockUserId2)
        const wallet = TransactionManager.wallet
        const signMsg = await wallet.signMessage(hashMockUserId2)

        // TODO encapsulate below to a function within original code
        const identity = new Identity(signMsg)
        userState = new UserState({
            db,
            provider,
            prover,
            unirepAddress: unirep.address,
            attesterId: BigInt(app.address),
            id: identity,
        })
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
                hashUserId: hashMockUserId2,
                fromServer: true,
            })
            .then((res) => {
                expect(res.body.status).to.equal('success')
                expect(res.body.hash).to.be.not.null
                expect(res).to.have.status(200)
            })
    })

    it('/api/signup, user not sign up with wrong proof and return error', async () => {
        // TODO: encapsulate below to a function within original code
        let initUser = await userService.getLoginOrInitUser('1234')
        const wallet = ethers.Wallet.createRandom()
        const signature = await wallet.signMessage(initUser.hashUserId)
        const identity = new Identity(signature)
        userState = new UserState({
            db,
            provider,
            prover,
            unirepAddress: unirep.address,
            attesterId: BigInt(app.address),
            id: identity,
        })

        await userState.sync.start()
        await userState.waitForSync()

        let wrongSignupProof = await userState.genUserSignUpProof()
        let publicSignals = wrongSignupProof.publicSignals.map((n) =>
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
                hashUserId: mockUserId,
                fromServer: false,
            })
            .then((res) => {
                expect(res).to.have.status(500)
            })
    })

    it('/api/signup, handle duplicate signup', async () => {
        // Reuse mockUserId from previous test and trigger duplicate signup

        // TODO: encapsulate below to a function within original code
        const identity = new Identity(hashMockUserId)
        userState = new UserState({
            db,
            provider,
            prover,
            unirepAddress: unirep.address,
            attesterId: BigInt(app.address),
            id: identity,
        })
        await userState.sync.start()
        await userState.waitForSync()
        const signupProof = await userState.genUserSignUpProof()
        var publicSignals = signupProof.publicSignals.map((n) => n.toString())

        await chai
            .request(`${HTTP_SERVER}`)
            .post('/api/signup')
            .set('content-type', 'application/json')
            .send({
                publicSignals: publicSignals,
                proof: signupProof._snarkProof,
                hashUserId: hashMockUserId,
                fromServer: false,
            })
            .then((res) => {
                expect(res).to.have.status(400)
            })
    })

    it('/api/login, registered user with own wallet', async () => {
        prepareUserLoginTwitterApiMock(mockUserId, mockCode, 'access-token')
        nock(`${CLIENT_URL}`)
            .get('/login')
            .query({
                code: hashMockUserId,
                status: `${UserRegisterStatus.REGISTERER}`,
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

    it('/api/login, registered user with server wallet', async () => {
        prepareUserLoginTwitterApiMock(mockUserId2, mockCode2, 'access-token2')
        const wallet = TransactionManager.wallet
        const signMsg = await wallet.signMessage(hashMockUserId2)
        nock(`${CLIENT_URL}`)
            .get('/login')
            .query({
                code: hashMockUserId2,
                status: `${UserRegisterStatus.REGISTERER_SERVER}`,
                signMsg: signMsg,
            })
            .reply(200)

        await chai
            .request(`${HTTP_SERVER}`)
            .get('/api/user')
            .set('content-type', 'application/json')
            .query({
                state: mockState,
                code: mockCode2,
            })
            .then((res) => {
                expect(res).to.have.status(200)
            })
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
