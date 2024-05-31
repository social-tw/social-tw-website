import { BsTwitter } from 'react-icons/bs'
import { LocalStorageHelper } from '../../../../utils/helpers/LocalStorageHelper'
import { fetchLogin } from '../../../../utils/api'
import LoginButton from '../LoginButton/LoginButton'

interface TwitterButtonProps {
    title: string
    handleClick: () => void
}

export function TwitterButton({ title, handleClick }: TwitterButtonProps) {
    return (
        <LoginButton
            isLoading={false}
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
    const handleClick = async () => {
        const { url } = await fetchLogin()
        LocalStorageHelper.setIsTwitterVerified()
        window.location.href = url
    }
    return (
        <TwitterButton
            title="使用 Twitter 帳號登入"
            handleClick={handleClick}
        />
    )
}

export function TwitterSignupButton() {
    const handleClick = async () => {
        const { url } = await fetchLogin()
        window.location.href = url
    }
    return (
        <TwitterButton
            title="使用 Twitter 帳號註冊"
            handleClick={handleClick}
        />
    )
}
