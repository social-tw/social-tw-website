import { useMutation } from '@tanstack/react-query'
import { useLoginWithServer, useSignup } from '@/features/auth'
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper'
import { MutationKeys } from '@/constants/queryKeys'

export function useSignupWithServer() {
    const { signup: baseSignup } = useSignup()

    const { login } = useLoginWithServer()

    const {
        isPending,
        error,
        mutate: signup,
    } = useMutation({
        mutationKey: [MutationKeys.SignupWithServer],
        mutationFn: async () => {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            const accessToken = LocalStorageHelper.getGuaranteedAccessToken()

            await baseSignup({
                hashUserId,
                accessToken,
                fromServer: true,
            })
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
