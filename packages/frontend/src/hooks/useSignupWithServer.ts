import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/User'
import { LocalStorageHelper } from '../utils/LocalStorageHelper'

export function useSignupWithServer() {
    const navigate = useNavigate()
    const {
        signup,
        setIsLogin,
        createUserState,
        setErrorCode,
        setSignupStatus,
    } = useUser()
    const signupWithServer = async () => {
        try {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            const accessToken = LocalStorageHelper.getGuaranteedAccessToken()
            const { userStateInstance, providerInstance } =
                await createUserState()

            setSignupStatus('pending')
            navigate('/')
            await signup(
                true,
                userStateInstance,
                hashUserId,
                accessToken,
                providerInstance,
            )
            setSignupStatus('success')
            setIsLogin(true)
        } catch (error: any) {
            setSignupStatus('error')
            setErrorCode('SIGNUP_FAILED')
        }
    }
    return signupWithServer
}
