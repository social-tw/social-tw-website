import { createProviderByUrl } from '@/utils/createProviderByUrl'
import useRelayConfig from './useRelayConfig'

export default function useWeb3Provider() {
    const config = useRelayConfig()

    return config ? createProviderByUrl(config.ETH_PROVIDER_URL) : undefined
}

export function getGuaranteedWeb3Provider(
    provider?: ReturnType<typeof createProviderByUrl>,
) {
    if (!provider) {
        throw new Error('web3 provider not initialized')
    }
    return provider
}
