import { Outlet } from 'react-router-dom'
import { Avatar } from './Avatar'

const ProfileLayout = () => {
    return (
        <div className="h-screen w-full md:pt-24 pt-8">
            <div className="w-full">
                <div className="w-full flex justify-center mb-8">
                    <Avatar />
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export default ProfileLayout
