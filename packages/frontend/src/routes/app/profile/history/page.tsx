import { LoginButton, useAuthStatus } from '@/features/auth'
import { AccountHistory } from '@/features/profile'
import { RiLoginBoxLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

export default function History() {
    return (
        <div className="px-4 py-8 lg:px-0">
            <AccountHistory />
        </div>
    )
}
