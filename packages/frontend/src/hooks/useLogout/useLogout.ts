import { LocalStorageHelper } from '@/utils/LocalStorageHelper'
import { useMutation } from '@tanstack/react-query'
import { MutationKeys } from '@/constants/queryKeys'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@/constants/paths'

export function useLogout() {
    const navigate = useNavigate()

    const {
        isPending,
        error,
        mutateAsync: logout,
    } = useMutation({
        mutationKey: [MutationKeys.Logout],
        mutationFn: async () => {
            LocalStorageHelper.removeSignature()
            LocalStorageHelper.removeIsTwitterVerified()
            LocalStorageHelper.removeHashUserId()
            LocalStorageHelper.removeAccessToken()
            LocalStorageHelper.removeSignMsg()
        },
        onSuccess: () => {
            navigate(PATHS.WELCOME)
        },
    })

    return {
        isPending,
        error,
        logout,
    }
}
