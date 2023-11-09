import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/User'
import { LocalStorageHelper } from '../utils/LocalStorageHelper'

export function useSignUpWithServer() {
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
            const userStateInstance = await createUserState()
            setSignupStatus('pending')
            navigate('/')
            await signup(true, userStateInstance, hashUserId, accessToken)
            setSignupStatus('success')
            setIsLogin('success')
        } catch (error: any) {
            setSignupStatus('error')
            setErrorCode(error.message)
        }
    }
    return signupWithServer
}
