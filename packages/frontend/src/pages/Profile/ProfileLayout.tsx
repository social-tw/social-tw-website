import { Outlet } from 'react-router-dom'
import Avatar from './Avatar'

export default function ProfileLayout() {
    return (
        <div className="h-screen w-full md:pt-24 pt-8">
            <div className="w-full h-full grid grid-rows-[auto_1fr]">
                <div className="w-full flex justify-center mb-8">
                    <Avatar />
                </div>
                <Outlet />
            </div>
        </div>
    )
}


