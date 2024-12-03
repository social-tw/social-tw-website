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

            try {
                const identity = userState.id
                const db = userState.db
                const provider = userState.sync.provider
                console.log('identity', identity.commitment.toString())

                const userId = identity.secret.toString()

                const signup = await db.findOne('UserSignUp', {
                    where: {
                        commitment: identity.commitment.toString(),
                    },
                })
                console.log('signup', signup)
                const blockNumber = signup.blockNumber
                const block = await provider.getBlock(blockNumber)
                console.log('block', block.timestamp)

                return {
                    userId,
                    signedUpDate: new Date(block.timestamp * 1000),
                }
            } catch (error) {
                console.log(error)
            }
        },
    })
}
