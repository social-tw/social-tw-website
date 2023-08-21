const useSignupWithServer = (
    navigate: (path: string) => void,
    setIsSignupLoading: (loading: boolean) => void,
    getServerSignMessage: () => Promise<void>,
    load: () => Promise<void>,
    signup: () => Promise<void>,
) => {
    const signupWithServer = async () => {
        try {
            setIsSignupLoading(true)
            navigate('/')
            await getServerSignMessage()
            await load()
            await signup()
            console.log('has signed up')
        } catch (error: any) {
            console.error(error)
        } finally {
            setIsSignupLoading(false)
        }
    }

    return signupWithServer
}

export default useSignupWithServer