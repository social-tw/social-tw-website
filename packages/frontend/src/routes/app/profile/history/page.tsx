import { LoginButton, useAuthStatus } from '@/features/auth'
import { AccountHistory } from '@/features/profile'
import { RiLoginBoxLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

export default function History() {
    const { isLoggedIn } = useAuthStatus()
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/welcome')
    }

    if (!isLoggedIn)
        return (
            <LoginButton
                isLoading={false}
                onClick={handleClick}
                title="登入你的帳號"
                color="#2F9CAF"
                icon={RiLoginBoxLine}
                text="lg"
                iconSize={24}
            />
        )
    return <AccountHistory />
}
