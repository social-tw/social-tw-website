import { createProviderByUrl } from '@/utils/createProviderByUrl'
import useRelayConfig from './useRelayConfig'

export function useWeb3Provider() {
    const config = useRelayConfig()

    const provider = config
        ? createProviderByUrl(config.ETH_PROVIDER_URL)
        : undefined

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
