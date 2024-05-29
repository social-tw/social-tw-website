import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    RiHourglassFill,
    RiLogoutBoxRLine,
    RiShieldStarLine,
} from 'react-icons/ri'
import { CyanButton, LoginButton, LogoutModal } from '@/features/auth'

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
    return (
        <div>
            <div className="flex flex-col w-full gap-4 md:flex-row md:gap-8">
                <HistoryButton />
                <ReputationButton />
                <LogoutButton />
            </div>
        </div>
    )
}
