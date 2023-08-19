import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { stringifyBigInts } from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { DataProof } from '@unirep-app/circuits'
import { SERVER } from '../config'
import prover from './Prover'
import { ethers } from 'ethers'

// TODO: Turn it into functional context instead of class!!!!
class User {
    currentEpoch: number = 0
    latestTransitionedEpoch: number = 0
    isTwitterVerified: boolean = false
    fromServer: boolean = false
    hasSignedUp: boolean = false
    data: bigint[] = []
    provableData: bigint[] = []
    userState?: UserState
    provider: any
    signature: string = '' // TODO: not sure how to setup inital data
    hashUserId: string = '' // TODO: not sure how to setup inital data

    constructor() {
        makeAutoObservable(this)
    }

    /**
     * This function should be called before user signs up for 
     * it will load the user's signature and hashUserId from local storage.
     * @returns 
     */    // Two states: user had logged in twitter and hasn't
    setFromServer() {
        this.fromServer = true
    }

    async load() {
        console.log("load .....")
        this.hashUserId = localStorage.getItem('hashUserId') ?? ''

        // TODO: if this is necessary?
        if (this.hashUserId) {
            this.isTwitterVerified = true
            console.log(this.hashUserId)
        } else {
            console.error('Invalid hashUserId for twitter')
        }

        this.signature = localStorage.getItem('signature') ?? ''
        

        if (this.hashUserId?.length == 0 && this.signature?.length == 0) {
            console.error("HashUserId and signature are wrong")
            return
        }

        // TODO: change hashUserId to signature
        // const identity = new Identity(signature)
        const identity = new Identity(this.signature)
        const {UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL} = await fetch(
            `${SERVER}/api/config`
        ).then((r) => r.json())

        const provider = ETH_PROVIDER_URL.startsWith('http')
            ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
            : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)
        this.provider = provider

        const userState = new UserState({
            provider,
            prover,
            unirepAddress: UNIREP_ADDRESS,
            attesterId: BigInt(APP_ADDRESS),
            id: identity,
        })
        await userState.sync.start()
        this.userState = userState
        console.log(this.userState)
        await userState.waitForSync()
        // TODO: check here to modify
        this.hasSignedUp = await userState.hasSignedUp()
        await this.loadData()
        this.latestTransitionedEpoch = await this.userState.latestTransitionedEpoch()
    }

    get fieldCount() {
        return this.userState?.sync.settings.fieldCount
    }

    get sumFieldCount() {
        return this.userState?.sync.settings.sumFieldCount
    }

    epochKey(nonce: number) {
        if (!this.userState) return '0x'
        const epoch = this.userState.sync.calcCurrentEpoch()
        const key = this.userState.getEpochKeys(epoch, nonce)
        return `0x${key.toString(16)}`
    }

    async loadData() {
        if (!this.userState) throw new Error('user state not initialized')

        this.data = await this.userState.getData()
        this.provableData = await this.userState.getProvableData()
    }

    async serverSignMessage(hashUserId: string) {
        const data = await fetch(`${SERVER}/api/identity`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                hashUserId,
            })
        }).then((r) => r.json())
        console.log(data)
        return data
    }

    async signup() {
        console.log(this.userState)
        if (!this.userState) throw new Error('user state not initialized')

        const signupProof = await this.userState.genUserSignUpProof()
        console.log(signupProof)

        // TODO: handle error
        const data = await fetch(`${SERVER}/api/signup`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: signupProof.publicSignals.map((n) =>
                    n.toString()
                ),
                proof: signupProof.proof,
                hashUserId: this.hashUserId,
                fromServer: this.fromServer,
            }),
        }).then((r) => r.json())

        console.log(data)

        // TODO: handle error
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        this.hasSignedUp = await this.userState.hasSignedUp()
        this.latestTransitionedEpoch = this.userState.sync.calcCurrentEpoch()
        console.log(this.hasSignedUp)
    }

    async requestData(
        reqData: { [key: number]: string | number },
        epkNonce: number
    ) {
        if (!this.userState) throw new Error('user state not initialized')

        for (const key of Object.keys(reqData)) {
            if (reqData[+key] === '') {
                delete reqData[+key]
                continue
            }
        }
        if (Object.keys(reqData).length === 0) {
            throw new Error('No data in the attestation')
        }
        const epochKeyProof = await this.userState.genEpochKeyProof({
            nonce: epkNonce,
        })
        const data = await fetch(`${SERVER}/api/request`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    reqData,
                    publicSignals: epochKeyProof.publicSignals.map((n) =>
                    n.toString()
                ),
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        await this.loadData()
    }

    async stateTransition() {
        if (!this.userState) throw new Error('user state not initialized')

        await this.userState.waitForSync()
        const signupProof = await this.userState.genUserStateTransitionProof()
        const data = await fetch(`${SERVER}/api/transition`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: signupProof.publicSignals.map((n) =>
                n.toString()
            ),
                proof: signupProof.proof,
            }),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        await this.loadData()
        this.latestTransitionedEpoch =
            await this.userState.latestTransitionedEpoch()
    }

    async proveData(data: { [key: number]: string | number }) {
        if (!this.userState) throw new Error('user state not initialized')
        const epoch = await this.userState.sync.loadCurrentEpoch()
        const stateTree = await this.userState.sync.genStateTree(epoch)
        const index = await this.userState.latestStateTreeLeafIndex(epoch)
        const stateTreeProof = stateTree.createProof(index)
        const provableData = await this.userState.getProvableData()
        const sumFieldCount = this.userState.sync.settings.sumFieldCount
        const values = Array(sumFieldCount).fill(0)
        for (let [key, value] of Object.entries(data)) {
            values[Number(key)] = value
        }
        const attesterId = this.userState.sync.attesterId
        const circuitInputs = stringifyBigInts({
            identity_secret: this.userState.id.secret,
            state_tree_indexes: stateTreeProof.pathIndices,
            state_tree_elements: stateTreeProof.siblings,
            data: provableData,
            epoch: epoch,
            attester_id: attesterId,
            value: values,
        })
        const {publicSignals, proof} = await prover.genProofAndPublicSignals(
            'dataProof',
            circuitInputs
        )
        const dataProof = new DataProof(publicSignals, proof, prover)
        const valid = await dataProof.verify()
        return stringifyBigInts({
            publicSignals: dataProof.publicSignals,
            proof: dataProof.proof,
            valid,
        })
    }

    logout() {
        this.hasSignedUp = false;  // set hasSignedUp to false when logout
        this.userState = undefined; // Clear user state
        this.signature = '';
        this.hashUserId = '';
        localStorage.removeItem('signature'); // Clear local storage
        localStorage.removeItem('hashUserId'); // Clear local storage
    }
}

const defaultValue = new User()

const UserContext = createContext<User>(defaultValue)

export {User, UserContext};
