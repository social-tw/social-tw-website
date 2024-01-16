import { IoChevronBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

import { PATHS } from '../../constants/paths'

export function BackToWelcomePageButton() {
    const navigate = useNavigate()
    return (
        <div
            className="absolute top-7 bg-[#E8ECF4] p-3 md:px-4 md:py-2 rounded-lg cursor-pointer flex justify-center items-center text-black"
            onClick={() =>
                navigate(PATHS.WELCOME, { replace: true, state: {} })
            }
        >
            <IoChevronBack size={16} />
            <span className="md:block hidden mx-2 text-sm font-bold">
                回到註冊頁
            </span>
        </div>
    )
}
