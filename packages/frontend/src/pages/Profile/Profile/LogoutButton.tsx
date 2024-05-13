import { useState } from 'react'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import LoginButton from '../../../components/login/LoginButton'
import LogoutModal from '@/components/modal/LogoutModal'

export default function LogoutButton() {
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
