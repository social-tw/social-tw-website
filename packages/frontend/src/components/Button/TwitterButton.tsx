import { BsTwitter } from 'react-icons/bs'
import { useUser } from '../../contexts/User'
import { LocalStorageHelper } from '../../utils/LocalStorageHelper'
import { fetchLogin } from '../../utils/api'
import LoginButton from '../login/LoginButton'

interface TwitterButtonProps {
    title: string
    isLoading: boolean
    handleClick: () => void
}

export function TwitterButton({
    title,
    isLoading,
    handleClick,
}: TwitterButtonProps) {
    return (
        <LoginButton
            isLoading={isLoading}
            icon={BsTwitter}
            onClick={handleClick}
            title={title}
            color="#2F9CAF"
            text="2xl"
            iconSize={32}
        />
    )
}

export function TwitterLoginButton() {
    const { signupStatus } = useUser()
    const handleClick = async () => {
        const { url } = await fetchLogin()
        LocalStorageHelper.setIsTwitterVerified()
        window.location.href = url
    }
    return (
        <TwitterButton
            isLoading={signupStatus === 'pending'}
            title="使用 Twitter 帳號登入"
            handleClick={handleClick}
        />
    )
}

export function TwitterSignupButton() {
    const { signupStatus } = useUser()
    const handleClick = async () => {
        const { url } = await fetchLogin()
        window.location.href = url
    }
    return (
        <TwitterButton
            isLoading={signupStatus === 'pending'}
            title="使用 Twitter 帳號註冊"
            handleClick={handleClick}
        />
    )
}
