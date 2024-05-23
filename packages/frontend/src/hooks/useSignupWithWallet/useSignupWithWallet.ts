import { useMutation } from '@tanstack/react-query'
import { useSignup } from '@/hooks/useSignup/useSignup'
import { useLoginWithWallet } from '@/hooks/useLoginWithWallet/useLoginWithWallet'
import { MutationKeys } from '@/constants/queryKeys'
import { LocalStorageHelper } from '@/utils/LocalStorageHelper'

export function useSignupWithWallet() {
    const { signup: baseSignup } = useSignup()

    const { login } = useLoginWithWallet()

    const {
        isPending,
        error,
        mutate: signup,
    } = useMutation({
        mutationKey: [MutationKeys.SignupWithWallet],
        mutationFn: async () => {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            const accessToken = LocalStorageHelper.getGuaranteedAccessToken()

            await baseSignup({ hashUserId, accessToken, fromServer: false })
        },
        onMutate: async () => {
            await login()
        },
    })

    return {
        isPending,
        error,
        signup,
    }
}
