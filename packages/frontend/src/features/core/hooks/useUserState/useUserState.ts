import { constructSchema } from 'anondb/types'
import { MemoryConnector } from 'anondb/web'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useQuery } from '@tanstack/react-query'
import { useRelayConfig } from '@/features/core'
import prover from '@/utils/prover'
import { schema } from '@/utils/schema'
import { QueryKeys } from '@/constants/queryKeys'
import {
    LOCAL_STORAGE,
    LocalStorageHelper,
} from '@/utils/helpers/LocalStorageHelper'
import { createProviderByUrl } from '@/utils/helpers/createProviderByUrl'

const db = new MemoryConnector(constructSchema(schema))

export function useUserState() {
    const {
        isPending: isConfigPending,
        isSuccess: isConfigSuccess,
        data: config,
    } = useRelayConfig()

    const [signature] = useLocalStorage<string | null>(
        LOCAL_STORAGE.SIGNATURE,
        null,
    )

    const {
        isPending,
        isSuccess,
        data: userState,
        refetch,
    } = useQuery({
        queryKey: [QueryKeys.UserState, config, signature],
        queryFn: async () => {
            if (userState) {
                userState.stop()
            }
            let _signature = signature
            if (!_signature) {
                _signature = LocalStorageHelper.getGuaranteedSignature()
            }
            if (!config || !_signature) {
                return null
            }
            try {
                const provider = createProviderByUrl(config.ETH_PROVIDER_URL)

                const _userState = new UserState({
                    db,
                    prover,
                    provider,
                    unirepAddress: config.UNIREP_ADDRESS,
                    attesterId: BigInt(config.APP_ADDRESS),
                    id: new Identity(_signature),
                })

                await _userState.start()
                await _userState.waitForSync()

                return _userState
            } catch {
                return null
            }
        },
        staleTime: Infinity,
    })

    const getGuaranteedUserState = async () => {
        if (userState) {
            return userState
        }
        const result = await refetch()

        if (result.isError) {
            throw new Error('user state not initialized')
        }
        return result.data as UserState
    }

    return {
        isPending: isPending || isConfigPending,
        isReady: isConfigSuccess && isSuccess,
        userState,
        getGuaranteedUserState,
    }
}
