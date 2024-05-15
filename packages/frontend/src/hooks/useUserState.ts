import { constructSchema } from 'anondb/types'
import { MemoryConnector } from 'anondb/web'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import useRelayConfig from '@/hooks/useRelayConfig'
import prover from '@/utils/prover'
import { schema } from '@/utils/schema'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import { useLocalStorage } from '@uidotdev/usehooks'
import { LOCAL_STORAGE } from '@/utils/LocalStorageHelper'
import { createProviderByUrl } from '@/utils/createProviderByUrl'

const db = new MemoryConnector(constructSchema(schema))

export function useUserState() {
    const { isPending: isConfigPending, data: config } = useRelayConfig()

    const [signature] = useLocalStorage<string | null>(
        LOCAL_STORAGE.SIGNATURE,
        null,
    )

    const { isPending, data: userState } = useQuery({
        queryKey: [QueryKeys.UserState, config, signature],
        queryFn: async () => {
            if (userState) {
                userState.stop()
            }
            if (!config || !signature) {
                return null
            }

            const provider = createProviderByUrl(config.ETH_PROVIDER_URL)

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

    const getGuaranteedUserState = () => {
        if (!userState) {
            throw new Error('user state not initialized')
        }
        return userState
    }

    return {
        isPending: isPending || isConfigPending,
        userState,
        getGuaranteedUserState,
    }
}
