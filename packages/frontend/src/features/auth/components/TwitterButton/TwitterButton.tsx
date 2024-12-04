import { BsTwitterX } from 'react-icons/bs'
import { fetchLogin } from '@/utils/api'
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper'
import LoginButton from '../LoginButton/LoginButton'

interface TwitterButtonProps {
    title: string
    handleClick: () => void
}

export function TwitterButton({ title, handleClick }: TwitterButtonProps) {
    return (
        <LoginButton
            isLoading={false}
            icon={BsTwitterX}
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
    return <TwitterButton title="使用 X 帳號登入" handleClick={handleClick} />
}

export function TwitterSignupButton() {
    const handleClick = async () => {
        const { url } = await fetchLogin()
        window.location.href = url
    }
    return <TwitterButton title="使用 X 帳號註冊" handleClick={handleClick} />
}
