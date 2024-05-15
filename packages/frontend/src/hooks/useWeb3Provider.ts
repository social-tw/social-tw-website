import { createProviderByUrl } from '@/utils/createProviderByUrl'
import useRelayConfig from './useRelayConfig'
import { useMemo } from 'react'

export function useWeb3Provider() {
    const { data: config } = useRelayConfig()

    const provider = useMemo(() => 
        config
            ? createProviderByUrl(config.ETH_PROVIDER_URL)
            : undefined,
        [config]
    )

    const getGuaranteedProvider = () => {
        if (!provider) {
            throw new Error('web3 provider not initialized')
        }
        return provider
    }

    return {
        provider,
        getGuaranteedProvider,
    }
}
