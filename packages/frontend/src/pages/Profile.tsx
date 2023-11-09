import { RiLogoutBoxRLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

import Avatar from '../assets/avatar.png'
import LoginButton from '../components/login/LoginButton'
import { PATHS } from '../constants/paths'
import { useUser } from '../contexts/User'

const Profile = () => {
    const { logout, signupStatus } = useUser()
    const navigate = useNavigate()
    const handleLogout = () => {
        navigate(PATHS.WELCOME, { replace: true, state: {} })
        logout()
    }
    return (
        <div className="h-screen w-full flex justify-center md:pt-24 pt-8">
            <div className="w-full md:w-11/12 md:max-w-[400px] flex flex-col items-center gap-8">
                <div className="w-[100px] h-[100px] rounded-full bg-gray-400 border-white border-4 flex items-center justify-center">
                    <img src={Avatar} alt="Avatar" />
                </div>
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
            </div>
        </div>
    )
}

export default Profile
