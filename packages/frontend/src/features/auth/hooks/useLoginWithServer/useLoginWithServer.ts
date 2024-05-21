import { useMutation } from '@tanstack/react-query'
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper'
import { MutationKeys } from '@/constants/queryKeys'
import { useLogin } from '@/features/auth'

export function useLoginWithServer() {
    const { login: baseLogin } = useLogin()

    const {
        isPending,
        error,
        mutateAsync: login,
    } = useMutation({
        mutationKey: [MutationKeys.LoginWithServer],
        mutationFn: async () => {
            const signMsg = LocalStorageHelper.getGuaranteedSignMsg()
            await baseLogin({ signature: signMsg })
        },
    })

    return {
        isPending,
        error,
        login,
    }
}
