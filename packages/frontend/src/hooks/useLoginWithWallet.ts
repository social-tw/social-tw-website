import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/User'
import { LocalStorageHelper } from '../utils/LocalStorageHelper'

export function useLoginWithWallet() {
    const navigate = useNavigate()
    const {
        handleWalletSignMessage,
        setIsLogin,
        createUserState,
        setErrorCode,
    } = useUser()
    const loginWithWallet = async () => {
        try {
            const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
            await handleWalletSignMessage(hashUserId)
            await createUserState()
            LocalStorageHelper.removeIsTwitterVerified()
            setIsLogin(true)
            navigate('/')
        } catch (error: any) {
            setErrorCode(error.message)
        }
    }

    return loginWithWallet
}
