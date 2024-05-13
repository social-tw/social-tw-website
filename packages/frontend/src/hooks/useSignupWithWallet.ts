import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import useSignup from '@/hooks/useSignup'
import { useLoginWithWallet } from '@/hooks/useLoginWithWallet'
import { MutationKeys } from '@/constants/queryKeys'
import { LocalStorageHelper } from '@/utils/LocalStorageHelper'

export function useSignupWithWallet() {
    const navigate = useNavigate()

    const { signup: baseSignup } = useSignup()

    const { login } = useLoginWithWallet()

    const {
        isPending,
        error,
        mutateAsync: signup,
    } = useMutation({
        mutationKey: [MutationKeys.SignupWithWallet],
        mutationFn: async () => {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            const accessToken = LocalStorageHelper.getGuaranteedAccessToken()

            await login()
            setTimeout(() => {
                baseSignup({ hashUserId, accessToken, fromServer: false })
            }, 0)
        },
        onMutate: () => {
            navigate('/')
        },
        onError: () => {
            navigate('/welcome')
        },
    })

    return {
        isPending,
        error,
        signup,
    }
}
