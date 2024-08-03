import { SERVER } from '@/constants/config'
import { YetLoginError } from '@/utils/errors'
import { type UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import axios from 'axios'

export class RelayApiService {
    private _userState?: UserState | null
    baseURL: string

    constructor(userState?: UserState | null) {
        this._userState = userState
        this.baseURL = `${SERVER}/api`
    }

    getUserState() {
        if (!this._userState) {
            throw new YetLoginError()
        }
        return this._userState
    }

    getClient() {
        const client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        return client
    }

    getAuthClient() {
        const userState = this.getUserState()

        const client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        client.interceptors.request.use(
            async (config) => {
                const { publicSignals, proof } =
                    await userState.genProveReputationProof({
                        minRep: 0,
                    })
                const token = btoa(
                    JSON.stringify(stringifyBigInts({ publicSignals, proof })),
                )
                config.headers.set('authentication', token)

                return config
            },
            (error) => Promise.reject(error),
        )

        return client
    }
}
