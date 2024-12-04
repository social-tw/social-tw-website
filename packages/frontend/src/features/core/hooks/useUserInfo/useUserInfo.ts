import { QueryKeys } from '@/constants/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { useUserState } from '../useUserState/useUserState'

export function useUserInfo() {
    const { userState } = useUserState()

    return useQuery({
        queryKey: [QueryKeys.UserInfo, userState?.id.toString()],
        queryFn: async () => {
            if (!userState) {
                return null
            }

            const identity = userState.id
            const db = userState.db
            const provider = userState.sync.provider

            const userId = identity.secret.toString()

            const signup = await db.findOne('UserSignUp', {
                where: {
                    commitment: identity.commitment.toString(),
                },
            })
            const blockNumber = signup.blockNumber
            const block = await provider.getBlock(blockNumber)

            return {
                userId,
                signedUpDate: new Date(block.timestamp * 1000),
            }
        },
    })
}
