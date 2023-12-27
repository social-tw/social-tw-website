import { RiLogoutBoxRLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import LoginButton from '../../../components/login/LoginButton'
import { useUser } from '../../../contexts/User'

export const LogoutButton = () => {
    const { logout, signupStatus } = useUser()
    const navigate = useNavigate()
    const handleLogout = () => {
        navigate('/login', { replace: true, state: {} })
        logout()
    }
    return (
        <LoginButton
            isLoading={signupStatus === 'pending'}
            onClick={handleLogout}
            title="登出"
            color="#2F9CAF"
            icon={RiLogoutBoxRLine}
            start={true}
            text="lg"
            iconSize={24}
        />
    )
}
