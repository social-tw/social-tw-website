import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
    useCallback,
    useMemo,
} from 'react'
import { stringifyBigInts } from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { DataProof } from '@unirep-app/circuits'
import { SERVER } from '../config'
import prover from './Prover'
import { ethers } from 'ethers'

export type SignupStatus = 'default' | 'pending' | 'success' | 'error'

export interface UserContextType {
    currentEpoch: number
    setCurrentEpoch: (epoch: number) => void
    latestTransitionedEpoch: number
    setLatestTransitionedEpoch: (epoch: number) => void
    isLogin: boolean
    setIsLogin: (param: boolean) => void
    fromServer: boolean
    setFromServer: (fromServer: boolean) => void
    hasSignedUp: boolean
    setHasSignedUp: (hasSignedUp: boolean) => void
    data: bigint[]
    setData: (data: bigint[]) => void
    provableData: bigint[]
    setProvableData: (provableData: bigint[]) => void
    userState?: UserState
    setUserState: (userState?: UserState) => void
    provider: any // TODO: Replace with the appropriate type
    setProvider: (provider: any) => void
    signature: string
    setSignature: (signature: string) => void
    hashUserId: string
    setHashUserId: (hashUserId: string) => void
    signupStatus: SignupStatus
    setSignupStatus: (signupStatus: SignupStatus) => void
    loadData: (userState: UserState) => Promise<void>
    fieldCount: () => number | undefined
    sumFieldCount: () => number | undefined
    epochKey: (nonce: number) => string
    load: () => Promise<void>
    handleServerSignMessage: () => Promise<void>
    handleWalletSignMessage: () => Promise<void>
    signup: () => Promise<void>
    stateTransition: () => Promise<void>
    requestData: (
        reqData: { [key: number]: string | number },
        epkNonce: number
    ) => Promise<void>
    proveData: (data: { [key: number]: string | number }) => Promise<any>
    logout: () => void
}

interface UserProviderProps {
    children: ReactNode
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
    children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [currentEpoch, setCurrentEpoch] = useState<number>(0)
    const [latestTransitionedEpoch, setLatestTransitionedEpoch] =
        useState<number>(0)
    const [isLogin, setIsLogin] = useState<boolean>(false)
    const [fromServer, setFromServer] = useState<boolean>(false)
    const [hasSignedUp, setHasSignedUp] = useState<boolean>(false)
    const [data, setData] = useState<bigint[]>([])
    const [provableData, setProvableData] = useState<bigint[]>([])
    const [userState, setUserState] = useState<UserState | undefined>()
    const [provider, setProvider] = useState<any>() // TODO: Replace with the appropriate type
    const [signature, setSignature] = useState<string>('')
    const [hashUserId, setHashUserId] = useState<string>('')
    const [signupStatus, setSignupStatus] = useState<SignupStatus>('default')

    const load = async () => {
        // TODO: It seems we don't need to store it in local storage
        const storedHashUserId = localStorage.getItem('hashUserId') ?? ''
        const storedSignature = localStorage.getItem('signature') ?? ''

        if (storedHashUserId.length === 0 && storedSignature.length === 0) {
            return
        }

        setHashUserId(storedHashUserId)
        setSignature(storedSignature)

        const identity = new Identity(storedSignature)
        const { UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL } = await fetch(
            `${SERVER}/api/config`
        ).then((r) => r.json())

        const providerInstance = ETH_PROVIDER_URL.startsWith('http')
            ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
            : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)

        setProvider(providerInstance)

        const userStateInstance = new UserState({
            provider: providerInstance,
            prover,
            unirepAddress: UNIREP_ADDRESS,
            attesterId: BigInt(APP_ADDRESS),
            id: identity,
        })

        setUserState(userStateInstance)
        await login(userStateInstance)
        await loadData(userStateInstance)
        const latestEpoch = await userStateInstance.latestTransitionedEpoch()
        setLatestTransitionedEpoch(latestEpoch)
    }

    const login = useCallback(
        async (userState: UserState) => {
            if (!userState) throw new Error('user state not initialized')

            try {
                await userState.sync.start()
                await userState.waitForSync()
                const hasSignedUpStatus = await userState.hasSignedUp()
                if (!hasSignedUpStatus)
                    throw new Error('Cannot login a account without signing up')
                setHasSignedUp(hasSignedUpStatus)
                setIsLogin(true)
            } catch (error) {
                console.error(error)
                setIsLogin(false)
                console.error('Login error')
            }
        },
        [userState]
    )

    const loadData = useCallback(
        async (userState: UserState) => {
            if (!userState) throw new Error('user state not initialized')

            const fetchedData = await userState.getData()
            const fetchedProvableData = await userState.getProvableData()

            setData(fetchedData)
            setProvableData(fetchedProvableData)
        },
        [userState]
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
        [userState]
    )

    const handleServerSignMessage = async () => {
        const response = await fetch(`${SERVER}/api/identity`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                hashUserId,
            }),
        })
        if (!response.ok) {
            throw new Error('False Identity')
        }
        const data = await response.json()
        const signMessage = data.signMsg
        setFromServer(true)
        localStorage.setItem('signature', signMessage)
    }

    const handleWalletSignMessage = async () => {
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
        setFromServer(false)
        localStorage.setItem('signature', signature)
    }

    const signup = useCallback(async () => {
        if (!userState) throw new Error('user state not initialized')
        const signupProof = await userState.genUserSignUpProof()
        const publicSignals = signupProof.publicSignals.map((item) =>
            item.toString()
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
                fromServer: fromServer,
            }),
        })

        if (!response.ok) {
            throw new Error('Signup Failed')
        }

        const data = await response.json()

        // TODO: handle error
        await provider.waitForTransaction(data.hash)
        await userState.waitForSync()
        const hasSignedUpStatus = await userState.hasSignedUp()
        setHasSignedUp(hasSignedUpStatus)
        const latestEpoch = userState.sync.calcCurrentEpoch()
        setLatestTransitionedEpoch(latestEpoch)
    }, [userState, provider, hashUserId, fromServer, SERVER])

    const stateTransition = async () => {
        if (!userState) throw new Error('user state not initialized')

        await userState.waitForSync()
        const signupProof = await userState.genUserStateTransitionProof()
        const data = await fetch(`${SERVER}/api/transition`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: signupProof.publicSignals,
                proof: signupProof.proof,
            }),
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
            epkNonce: number
        ) => {
            if (!userState) throw new Error('user state not initialized')

            const filteredReqData = Object.entries(reqData)
                .filter(([_, value]) => value !== '')
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
                    })
                ),
            })
            const data = await response.json()
            await provider.waitForTransaction(data.hash)
            await userState.waitForSync()
            await loadData(userState)
        },
        [userState, provider, loadData]
    )

    const proveData = useCallback(
        async (data: { [key: number]: string | number }) => {
            if (!userState) throw new Error('user state not initialized')
            const epoch = await userState.sync.loadCurrentEpoch()
            const stateTree = await userState.sync.genStateTree(epoch)
            const index = await userState.latestStateTreeLeafIndex(epoch)
            const stateTreeProof = stateTree.createProof(index)
            const provableData = await userState.getProvableData()
            const sumFieldCount = userState.sync.settings.sumFieldCount
            const values = Array(sumFieldCount).fill(0)
            for (let [key, value] of Object.entries(data)) {
                values[Number(key)] = value
            }
            const attesterId = userState.sync.attesterId
            const circuitInputs = stringifyBigInts({
                identity_secret: userState.id.secret,
                state_tree_indexes: stateTreeProof.pathIndices,
                state_tree_elements: stateTreeProof.siblings,
                data: provableData,
                epoch: epoch,
                attester_id: attesterId,
                value: values,
            })
            const { publicSignals, proof } =
                await prover.genProofAndPublicSignals(
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
        },
        [userState]
    )

    const logout = () => {
        setHasSignedUp(false)
        setUserState(undefined)
        setSignature('')
        setHashUserId('')
        localStorage.removeItem('signature')
        localStorage.removeItem('hashUserId')
    }

    const value: UserContextType = {
        currentEpoch,
        setCurrentEpoch,
        latestTransitionedEpoch,
        setLatestTransitionedEpoch,
        isLogin,
        setIsLogin,
        fromServer,
        setFromServer,
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
        signupStatus,
        setSignupStatus,
        loadData,
        fieldCount,
        sumFieldCount,
        epochKey,
        load,
        handleServerSignMessage,
        handleWalletSignMessage,
        signup,
        stateTransition,
        requestData,
        proveData,
        logout,
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
