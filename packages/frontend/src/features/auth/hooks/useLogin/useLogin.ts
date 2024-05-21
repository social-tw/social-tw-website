import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper'
import { PATHS } from '@/constants/paths'
import { MutationKeys } from '@/constants/queryKeys'
import { LoginUnknownError } from '@/utils/errors'

export function useLogin() {
    const navigate = useNavigate()

    const {
        isPending,
        error,
        mutateAsync: login,
    } = useMutation({
        mutationKey: [MutationKeys.Login],
        mutationFn: async ({ signature }: { signature: string }) => {
            try {
                LocalStorageHelper.setSignature(signature)
                LocalStorageHelper.removeIsTwitterVerified()
            } catch {
                throw new LoginUnknownError()
            }
        },
        onSuccess: () => {
            navigate(PATHS.HOME)
        },
    })

    return {
        isPending,
        error,
        login,
    }
}
