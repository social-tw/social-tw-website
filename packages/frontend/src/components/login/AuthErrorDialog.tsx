import React from 'react'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'
import Backdrop from '@/components/common/Backdrop'
import { useUser } from '@/contexts/User'
import useErrorMessage from '@/hooks/useErrorMessage'

interface ErrorModalProps {
    isOpen: boolean
    buttonText?: string
}

const AuthErrorDialog: React.FC<ErrorModalProps> = ({
    isOpen,
    buttonText = '返回註冊頁重新嘗試',
}) => {
    const { setSignupStatus, errorCode, setErrorCode } = useUser()
    const { message } = useErrorMessage(errorCode)
    const navigate = useNavigate()
    const handleClick = () => {
        setSignupStatus('default')
        navigate('/welcome')
        setErrorCode('')
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

export default AuthErrorDialog
