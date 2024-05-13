import React from 'react'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'
import Backdrop from '@/components/common/Backdrop'

interface ErrorModalProps {
    isOpen: boolean
    message?: string
    buttonText?: string
}

export default function AuthErrorDialog({
    isOpen,
    message = '',
    buttonText = '返回註冊頁重新嘗試',
}: ErrorModalProps) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/welcome')
    }

    return (
        <Backdrop isOpen={isOpen} position="fixed" background={'bg-black/75'}>
            <div className="flex items-center justify-center w-full h-full p-4">
                <div className="p-12 flex flex-col justify-center items-center bg-white/80 relative text-black text-[15px] tracking-wider gap-12 rounded-lg">
                    <GrFormClose
                        className="absolute cursor-pointer top-4 right-4"
                        size={24}
                        onClick={handleClick}
                    />
                    <div className="flex flex-col justify-center gap-6">
                        <p>親愛的用戶：</p>
                        <p>{message}</p>
                    </div>
                    <button
                        className="w-full py-4 bg-[#FF892A] rounded-lg text-white font-bold tracking-wider text-lg"
                        onClick={handleClick}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </Backdrop>
    )
}
