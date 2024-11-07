import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    RiHourglassFill,
    RiLogoutBoxRLine,
    RiShieldStarLine,
    RiLoginBoxLine,
} from 'react-icons/ri'
import {
    CyanButton,
    LoginButton,
    LogoutModal,
    useAuthStatus,
} from '@/features/auth'

function HistoryButton() {
    const navigate = useNavigate()
    
    const handleLogout = () => {
        navigate('/profile/history')
    }

    return (
        <CyanButton
            isLoading={false}
            onClick={handleLogout}
            title="歷史紀錄"
            icon={RiHourglassFill}
            start={true}
            text="lg"
            iconSize={24}
        />
    )
}

function ReputationButton() {
    const navigate = useNavigate()
    const handleLogout = () => {
        navigate('/profile/reputation')
    }
    return (
        <CyanButton
            isLoading={false}
            onClick={handleLogout}
            title="信譽分數"
            icon={RiShieldStarLine}
            start={true}
            text="lg"
            iconSize={24}
        />
    )
}

function LogoutButton() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <LoginButton
                isLoading={false}
                onClick={() => setIsOpen(true)}
                title="登出"
                color="#2F9CAF"
                icon={RiLogoutBoxRLine}
                start={true}
                text="lg"
                iconSize={24}
            />
            <LogoutModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
        </>
    )
}

export default function ProfilePage() {
    const { isLoggedIn } = useAuthStatus()
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/welcome')
    }

    return (
        <div>
            <div className="flex flex-col w-full gap-4 md:flex-row md:gap-8">
                {isLoggedIn ? (
                    <>
                        <HistoryButton />
                        <ReputationButton />
                        <LogoutButton />
                    </>
                ) : (
                    <LoginButton
                        isLoading={false}
                        onClick={handleClick}
                        title="登入你的帳號"
                        color="#2F9CAF"
                        icon={RiLoginBoxLine}
                        text="lg"
                        iconSize={24}
                    />
                )}
            </div>
        </div>
    )
}
