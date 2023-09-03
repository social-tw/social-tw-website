const useLoginWithServer = (
    navigate: (path: string) => void,
    hashUserId: string | null,
    signMsg: string | null,
) => {
    const loginWithServer = () => {
        try {
            if (!hashUserId) {
                throw new Error('No hash user id')
            } 
            localStorage.setItem('hashUserId', hashUserId)
            if (!signMsg) {
                throw new Error('No signature')
            } 
            localStorage.setItem('signature', signMsg)
            navigate('/')
        } catch (error) {
            console.error(error)
        }
    }
    return loginWithServer
}

export default useLoginWithServer
