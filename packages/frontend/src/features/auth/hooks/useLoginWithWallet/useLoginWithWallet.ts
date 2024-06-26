import { useMutation } from '@tanstack/react-query'
import { useLogin } from '@/features/auth'
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper'
import { EthereumHelper } from '@/utils/helpers/EthereumHelper'

export function useLoginWithWallet() {
    const { login: baseLogin } = useLogin()

    const {
        isPending,
        error,
        mutateAsync: login,
    } = useMutation({
        mutationFn: async () => {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            const signature =
                await EthereumHelper.signUserIdWithWallet(hashUserId)
            await baseLogin({ signature })
        },
    })

    return {
        isPending,
        error,
        login,
    }
}
