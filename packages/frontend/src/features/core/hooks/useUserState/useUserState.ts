import { QueryKeys } from '@/constants/queryKeys'
import { useRelayConfig } from '@/features/core'
import {
    LOCAL_STORAGE,
    LocalStorageHelper,
} from '@/utils/helpers/LocalStorageHelper'
import { createProviderByUrl } from '@/utils/helpers/createProviderByUrl'
import prover from '@/utils/prover'
import { schema } from '@/utils/schema'
import { Identity } from '@semaphore-protocol/identity'
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@uidotdev/usehooks'
import { UserState } from '@unirep/core'
import { IndexedDBConnector } from 'anondb/web'

async function getDb(appAddress: string) {
    const db = await IndexedDBConnector.create(schema)
    const version = await db.findOne('Version', {
        where: {
            appAddress,
        },
    })

    if (version && version.appAddress !== appAddress) {
        await db.transaction((transactionDB) => {
            for (const table of Object.keys(db.schema)) {
                transactionDB.delete(table, { where: {} })
            }
            transactionDB.delete('Version', {
                where: {
                    appAddress: version.appAddress,
                },
            })
            transactionDB.create('Version', {
                appAddress,
            })
        })
    }

    return db
}

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
            let _signature = signature
            if (!_signature) {
                _signature = LocalStorageHelper.getGuaranteedSignature()
            }
            if (!config || !_signature) {
                return null
            }

            try {
                if (userState) {
                    userState.stop()
                }

                const db = await getDb(config.APP_ADDRESS)
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
