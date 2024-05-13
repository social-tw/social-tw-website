import { Outlet } from 'react-router-dom'
import Avatar from './Avatar'

export default function ProfileLayout() {
    return (
        <div className="w-full h-screen px-4 pt-8 md:pt-24">
            <div className="w-full h-full grid grid-rows-[auto_1fr]">
                <div className="flex justify-center w-full mb-8">
                    <Avatar />
                </div>
                <Outlet />
            </div>
        </div>
    )
}
