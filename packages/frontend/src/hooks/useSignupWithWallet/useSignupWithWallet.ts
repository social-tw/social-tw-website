import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useSignup } from '@/hooks/useSignup/useSignup'
import { useLoginWithWallet } from '@/hooks/useLoginWithWallet/useLoginWithWallet'
import { MutationKeys } from '@/constants/queryKeys'
import { LocalStorageHelper } from '@/utils/LocalStorageHelper'
import { PATHS } from '@/constants/paths'

export function useSignupWithWallet() {
    const navigate = useNavigate()

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
        onError: () => {
            navigate(PATHS.WELCOME)
        },
    })

    return {
        isPending,
        error,
        signup,
    }
}
