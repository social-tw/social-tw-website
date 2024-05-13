import { useNavigate } from 'react-router-dom'
import { LocalStorageHelper } from '../utils/LocalStorageHelper'
import useSignup from './useSignup'
import { useMutation } from '@tanstack/react-query'
import { MutationKeys } from '@/constants/queryKeys'
import { useLoginWithServer } from './useLoginWithServer'

export function useSignupWithServer() {
    const navigate = useNavigate()

    const { signup: baseSignup } = useSignup()

    const { login } = useLoginWithServer()

    const {
        isPending,
        error,
        mutateAsync: signup,
    } = useMutation({
        mutationKey: [MutationKeys.SignupWithServer],
        mutationFn: async () => {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            const accessToken = LocalStorageHelper.getGuaranteedAccessToken()

            await login()
            setTimeout(() => {
                baseSignup({
                    hashUserId,
                    accessToken,
                    fromServer: true,
                })
            }, 0)
        },
        onMutate: () => {
            navigate('/')
        },
    })

    return {
        isPending,
        error,
        signup,
    }
}
