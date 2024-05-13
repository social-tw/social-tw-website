import { constructSchema } from 'anondb/types'
import { MemoryConnector } from 'anondb/web'
import { UserState } from '@unirep/core'
import useRelayConfig from '@/hooks/useRelayConfig'
import useWeb3Provider from '@/hooks/useWeb3Provider'
import prover from '@/utils/prover'
import { schema } from '@/utils/schema'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import { useLocalStorage } from '@uidotdev/usehooks'
import { LOCAL_STORAGE } from '@/utils/LocalStorageHelper'
import { Identity } from '@semaphore-protocol/identity'

const db = new MemoryConnector(constructSchema(schema))

export default function useUserState() {
    const config = useRelayConfig()

    const provider = useWeb3Provider()

    const [signature] = useLocalStorage<string | null>(
        LOCAL_STORAGE.SIGNATURE,
        null,
    )

    const { isPending, data: userState } = useQuery({
        queryKey: [QueryKeys.UserState, config, provider, signature],
        queryFn: async () => {
            if (userState) {
                userState.stop()
            }
            if (!config || !provider || !signature) {
                return null
            }

            const _userState = new UserState({
                db,
                prover,
                provider,
                unirepAddress: config.UNIREP_ADDRESS,
                attesterId: BigInt(config.APP_ADDRESS),
                id: new Identity(signature),
            })

            await _userState.start()
            await _userState.waitForSync()

            return _userState
        },
    })

    return {
        isPending,
        userState,
    }
}

export function getGuaranteedUserState(userState?: UserState | null) {
    if (!userState) {
        throw new Error('user state not initialized')
    }
    return userState
}
