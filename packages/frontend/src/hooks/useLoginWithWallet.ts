import { useMutation } from '@tanstack/react-query'
import useLogin from '@/hooks/useLogin'
import { LocalStorageHelper } from '@/utils/LocalStorageHelper'
import { EthereumHelper } from '@/utils/EthereumHelper'

export function useLoginWithWallet() {
    const { login: baseLogin } = useLogin()

    const {
        isPending,
        error,
        mutateAsync: login,
    } = useMutation({
        mutationFn: async () => {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            const signature = await EthereumHelper.signUserIdWithWallet(
                hashUserId,
            )
            await baseLogin(signature)
        },
    })

    return {
        isPending,
        error,
        login,
    }
}
