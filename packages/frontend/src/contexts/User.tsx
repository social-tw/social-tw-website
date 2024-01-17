import { IndexedDBConnector } from "anondb/web";
import { ethers } from "ethers";
import React, {
    createContext, ReactNode, useCallback, useContext, useMemo, useState
} from "react";
import { Identity } from "@semaphore-protocol/identity";
import { DataProof } from "@unirep-app/circuits";
import { stringifyBigInts } from "@unirep/utils";
import { SERVER } from "../config";
import ERROR_MESSAGES from "../constants/error-messages/loginErrorMessage";
import useInitUser from "../hooks/useInitUser";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { fetchRelayConfig } from "../utils/api";
import { createProviderByUrl } from "../utils/createProviderByUrl";
import prover from "./Prover";
import { schema } from "./schema";
import { UserState } from "./Userstate";

export type SignupStatus = 'default' | 'pending' | 'success' | 'error'

export interface UserContextType {
    currentEpoch: number
    setCurrentEpoch: (epoch: number) => void
    latestTransitionedEpoch: number
    setLatestTransitionedEpoch: (epoch: number) => void
    isLogin: any
    setIsLogin: (param: boolean) => void
    hasSignedUp: boolean
    setHasSignedUp: (hasSignedUp: boolean) => void
    data: bigint[]
    setData: (data: bigint[]) => void
    provableData: bigint[]
    setProvableData: (provableData: bigint[]) => void
    userState?: UserState
    setUserState: (userState?: UserState) => void
    provider: any
    setProvider: (provider: any) => void
    signature: string
    setSignature: (signature: string) => void
    hashUserId: string
    setHashUserId: (hashUserId: string) => void
    token: string
    setToken: (token: string) => void
    signupStatus: SignupStatus
    setSignupStatus: (signupStatus: SignupStatus) => void
    errorCode: keyof typeof ERROR_MESSAGES | ''
    setErrorCode: (errorCode: keyof typeof ERROR_MESSAGES | '') => void
    loadData: (userState: UserState) => Promise<void>
    fieldCount: () => number | undefined
    sumFieldCount: () => number | undefined
    epochKey: (nonce: number) => string
    load: () => Promise<void>
    handleWalletSignMessage: (hashUserId: string) => Promise<void>
    signup: (
        fromServer: boolean,
        hashUserId: string,
        accessToken: string,
    ) => Promise<void>
    stateTransition: () => Promise<void>
    requestData: (
        reqData: { [key: number]: string | number },
        epkNonce: number,
    ) => Promise<void>
    proveData: (data: { [key: number]: string | number }) => Promise<any>
    logout: () => void
    createUserState: () => Promise<UserState>
}

interface UserProviderProps {
    children: ReactNode
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// TODO: Move the methods to a separate file
// TODO: Remove unnecessary states
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [currentEpoch, setCurrentEpoch] = useState<number>(0)
    const [latestTransitionedEpoch, setLatestTransitionedEpoch] =
        useState<number>(0)
    const [isLogin, setIsLogin] = useLocalStorage<boolean>('loginStatus', false)
    const [hasSignedUp, setHasSignedUp] = useState<boolean>(false)
    const [data, setData] = useState<bigint[]>([])
    const [provableData, setProvableData] = useState<bigint[]>([])
    const [userState, setUserState] = useState<UserState | undefined>()
    const [provider, setProvider] = useState<any>()
    const [signature, setSignature] = useState<string>('')
    const [hashUserId, setHashUserId] = useState<string>('')
    const [token, setToken] = useState<string>('')
    const [signupStatus, setSignupStatus] = useState<SignupStatus>('default')
    const [errorCode, setErrorCode] = useState<
        keyof typeof ERROR_MESSAGES | ''
    >('')

    const load = async () => {
        const userStateInstance = await createUserState()
        if (!userStateInstance) throw new Error('No user state instance')
        await checkSignupStatus(userStateInstance)
        await loadData(userStateInstance)
        const latestEpoch = await userStateInstance.latestTransitionedEpoch()
        setLatestTransitionedEpoch(latestEpoch)
    }

    const createUserState = async () => {
        if (userState) return userState
        const storedSignature = localStorage.getItem('signature') ?? ''
        const relayConfig = await fetchRelayConfig()
        const provider = createProviderByUrl(relayConfig.ETH_PROVIDER_URL)
        setProvider(provider)

        const db = await IndexedDBConnector.create(schema)
        const userStateInstance = new UserState({
            provider,
            prover,
            unirepAddress: relayConfig.UNIREP_ADDRESS,
            attesterId: BigInt(relayConfig.APP_ADDRESS),
            id: new Identity(storedSignature),
            db,
        })

        await userStateInstance.start()
        await userStateInstance.waitForSync()

        setUserState(userStateInstance)
        return userStateInstance
    }

    const checkSignupStatus = useCallback(
        async (userState: UserState) => {
            if (!userState) throw new Error('user state not initialized')
            const hasSignedUpStatus = await userState.hasSignedUp()
            setHasSignedUp(hasSignedUpStatus)
        },
        [userState],
    )

    const loadData = useCallback(
        async (userState: UserState) => {
            if (!userState) throw new Error('user state not initialized')

            const fetchedData = await userState.getData()
            const fetchedProvableData = await userState.getProvableData()

            setData(fetchedData)
            setProvableData(fetchedProvableData)
        },
        [userState],
    )

    const fieldCount = useMemo(() => {
        return userState?.sync.settings.fieldCount
    }, [userState])

    const sumFieldCount = useMemo(() => {
        return userState?.sync.settings.sumFieldCount
    }, [userState])

    const epochKey = useCallback(
        (nonce: number) => {
            if (!userState) return '0x'
            const epoch = userState.sync.calcCurrentEpoch()
            const key = userState.getEpochKeys(epoch, nonce)
            return `0x${key.toString(16)}`
        },
        [userState],
    )

    const handleWalletSignMessage = async (hashUserId: string) => {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        })
        const account = accounts[0]

        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [
                ethers.utils.hexlify(ethers.utils.toUtf8Bytes(hashUserId)),
                account,
            ],
        })
        localStorage.setItem('signature', signature)
    }

    const signup = async (
        fromServer: boolean,
        hashUserId: string,
        accessToken: string,
    ) => {
        if (!userState) throw new Error('user state not initialized')

        const signupProof = await userState.genUserSignUpProof()
        const publicSignals = signupProof.publicSignals.map((item) =>
            item.toString(),
        )
        const proof = signupProof.proof.map((item) => item.toString())

        const response = await fetch(`${SERVER}/api/signup`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: publicSignals,
                proof: proof,
                hashUserId: hashUserId,
                token: accessToken,
                fromServer: fromServer,
            }),
        })

        if (!response.ok) {
            throw new Error(ERROR_MESSAGES.SIGNUP_FAILED.code)
        }
        const data = await response.json()

        await provider.waitForTransaction(data.hash)
        await userState.waitForSync()
        const hasSignedUpStatus = await userState.hasSignedUp()
        setHasSignedUp(hasSignedUpStatus)
        const latestEpoch = userState.sync.calcCurrentEpoch()
        setLatestTransitionedEpoch(latestEpoch)
    }

    const stateTransition = async () => {
        if (!userState) throw new Error('user state not initialized')

        await userState.waitForSync()
        const signupProof = await userState.genUserStateTransitionProof()
        const data = await fetch(`${SERVER}/api/transition`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    publicSignals: signupProof.publicSignals,
                    proof: signupProof.proof,
                }),
            ),
        }).then((r) => r.json())
        await provider.waitForTransaction(data.hash)
        await userState.waitForSync()
        await loadData(userState)
        const latestTransitionEpoch = await userState.latestTransitionedEpoch()
        setLatestTransitionedEpoch(latestTransitionEpoch)
    }

    const requestData = useCallback(
        async (
            reqData: { [key: number]: string | number },
            epkNonce: number,
        ) => {
            if (!userState) throw new Error('user state not initialized')

            const filteredReqData = Object.entries(reqData)
                .filter(([, value]) => value !== '')
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

            if (Object.keys(filteredReqData).length === 0) {
                throw new Error('No data in the attestation')
            }

            const epochKeyProof = await userState.genEpochKeyProof({
                nonce: epkNonce,
            })
            const response = await fetch(`${SERVER}/api/request`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(
                    stringifyBigInts({
                        reqData: filteredReqData,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    }),
                ),
            })
            const data = await response.json()
            await provider.waitForTransaction(data.hash)
            await userState.waitForSync()
            await loadData(userState)
        },
        [userState, provider, loadData],
    )

    const proveData = useCallback(
        async (data: { [key: number]: string | number }) => {
            if (!userState) throw new Error('user state not initialized')
            const epoch = await userState.sync.loadCurrentEpoch()
            const chainId = userState.chainId
            const stateTree = await userState.sync.genStateTree(epoch)
            const index = await userState.latestStateTreeLeafIndex(epoch)
            const stateTreeProof = stateTree.createProof(index)
            const provableData = await userState.getProvableData()
            const sumFieldCount = userState.sync.settings.sumFieldCount
            const values = Array(sumFieldCount).fill(0)
            for (const [key, value] of Object.entries(data)) {
                values[Number(key)] = value
            }
            const attesterId = userState.sync.attesterId
            const circuitInputs = stringifyBigInts({
                identity_secret: userState.id.secret,
                state_tree_indices: stateTreeProof.pathIndices,
                state_tree_elements: stateTreeProof.siblings,
                data: provableData,
                epoch: epoch,
                chain_id: chainId,
                attester_id: attesterId,
                value: values,
            })
            const { publicSignals, proof } =
                await prover.genProofAndPublicSignals(
                    'dataProof',
                    circuitInputs,
                )
            const dataProof = new DataProof(publicSignals, proof, prover)
            const valid = await dataProof.verify()
            return stringifyBigInts({
                publicSignals: dataProof.publicSignals,
                proof: dataProof.proof,
                valid,
            })
        },
        [userState],
    )

    const logout = () => {
        userState?.stop()
        // FIXME: db might be blocked
        indexedDB.deleteDatabase('anondb')
        setHasSignedUp(false)
        setIsLogin(false)
        setUserState(undefined)
        setSignature('')
        setHashUserId('')
        setToken('')
        localStorage.removeItem('hashUserId')
        localStorage.removeItem('token')
        localStorage.removeItem('signature')
        localStorage.removeItem('loginStatus')
    }

    useInitUser(load, logout)

    const value: UserContextType = {
        currentEpoch,
        setCurrentEpoch,
        latestTransitionedEpoch,
        setLatestTransitionedEpoch,
        isLogin,
        setIsLogin,
        hasSignedUp,
        setHasSignedUp,
        data,
        setData,
        provableData,
        setProvableData,
        userState,
        setUserState,
        provider,
        setProvider,
        signature,
        setSignature,
        hashUserId,
        setHashUserId,
        token,
        setToken,
        signupStatus,
        setSignupStatus,
        errorCode,
        setErrorCode,
        loadData,
        fieldCount,
        sumFieldCount,
        epochKey,
        load,
        handleWalletSignMessage,
        signup,
        stateTransition,
        requestData,
        proveData,
        logout,
        createUserState,
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContext

export const useUser = (): UserContextType => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
