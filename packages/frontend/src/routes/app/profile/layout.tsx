import AvatarIcon from '@/assets/img/avatar.png'
import { Outlet } from 'react-router-dom'

function Avatar() {
    return (
        <div className="flex items-center gap-4">
            <div
                className={`
              w-[80px] h-[80px] rounded-full bg-gray-400 border-white border-4 flex items-center justify-center
              md:w-[100px] md:h-[100px]
            `}
            >
                <img src={AvatarIcon} alt="Avatar" />
            </div>
        </div>
    )
}

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
