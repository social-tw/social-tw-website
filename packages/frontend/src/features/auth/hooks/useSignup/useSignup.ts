import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { useAuthStatus } from '@/features/auth'
import { useUserState, useWeb3Provider } from '@/features/core'
import { relaySignUp } from '@/utils/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    resetSignupProgress,
    startSignupProgress,
} from '../../components/SignupProgress/signupProgressStore'
import { clearNotifications } from '@/features/notification/stores/useNotificationStore'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'

export function useSignup() {
    const sendNotification = useSendNotification()
    const queryClient = useQueryClient()

    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const { isSignedUp } = useAuthStatus()

    const {
        isPending,
        error,
        mutateAsync: signup,
    } = useMutation({
        mutationKey: [MutationKeys.Signup],
        mutationFn: async ({
            hashUserId,
            accessToken,
            fromServer,
        }: {
            hashUserId: string
            accessToken: string
            fromServer: boolean
        }) => {
            if (isSignedUp) return
            startSignupProgress()

            const provider = getGuaranteedProvider()
            const userState = await getGuaranteedUserState()

            const proof = await userState.genUserSignUpProof()

            const data = await relaySignUp(
                proof,
                hashUserId,
                accessToken,
                fromServer,
            )

            await provider.waitForTransaction(data.txHash)
            await userState.waitForSync()
            clearNotifications()
            sendNotification(NotificationType.SIGN_UP_SUCCESS)

            return data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QueryKeys.HasSignedUp],
            })
            await queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReputationScore],
            })
        },
        onError: () => {
            resetSignupProgress()
        },
    })

    return {
        isPending,
        error,
        signup,
    }
}
