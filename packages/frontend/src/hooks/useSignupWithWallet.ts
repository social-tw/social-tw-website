import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/User'
import { LocalStorageHelper } from '../utils/LocalStorageHelper'

export function useSignupWithWallet() {
    const navigate = useNavigate()
    const {
        handleWalletSignMessage,
        signup,
        setIsLogin,
        createUserState,
        setErrorCode,
        setSignupStatus,
    } = useUser()
    const signUpWithWallet = async () => {
        try {
            const accessToken = LocalStorageHelper.getGuaranteedAccessToken()
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            await handleWalletSignMessage(hashUserId)
            const { userStateInstance, providerInstance } =
                await createUserState()

            setSignupStatus('pending')
            navigate('/')
            await signup(
                false,
                userStateInstance,
                hashUserId,
                accessToken,
                providerInstance,
            )
            setSignupStatus('success')
            setIsLogin(true)
        } catch (error: any) {
            setSignupStatus('error')
            setErrorCode('WALLET_ISSUE')
        }
    }
    return signUpWithWallet
}
