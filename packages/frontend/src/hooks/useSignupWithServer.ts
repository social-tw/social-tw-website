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
            const userStateInstance = await createUserState()

            setSignupStatus('pending')
            navigate('/')
            await signup(true, userStateInstance, hashUserId, accessToken)
            setSignupStatus('success')
            setIsLogin(true)
        } catch (error: any) {
            setSignupStatus('error')
            setErrorCode(error.message)
        }
    }
    return signupWithServer
}
