import { UserState } from '@unirep/core'

const useLoginWithServer = (
    navigate: (path: string) => void,
    hashUserId: string | null,
    signMsg: string | null,
    createUserState: () => Promise<UserState | undefined>
) => {
    const loginWithServer = async () => {
        try {
            if (!hashUserId) {
                throw new Error('No hash user id')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!signMsg) {
                throw new Error('No signature')
            }
            localStorage.setItem('signature', signMsg)
            await createUserState()
            localStorage.setItem('loginStatus', 'success')
            navigate('/')
            console.log('has logged in')
        } catch (error) {
            console.error(error)
        }
    }
    return loginWithServer
}

export default useLoginWithServer
