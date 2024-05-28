import { LocalStorageHelper } from '../../utils/LocalStorageHelper'
import { useMutation } from '@tanstack/react-query'
import { useLogin } from '../useLogin/useLogin'
import { MutationKeys } from '@/constants/queryKeys'

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
