import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper'
import { MutationKeys } from '@/constants/queryKeys'
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
