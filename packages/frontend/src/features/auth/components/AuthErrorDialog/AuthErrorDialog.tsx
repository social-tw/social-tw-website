import { PATHS } from '@/constants/paths'
import Backdrop from '@/features/shared/components/Backdrop/Backdrop'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'
import { useAuthStatus } from '../../hooks/useAuthStatus/useAuthStatus'

interface ErrorModalProps {
    isOpen: boolean
    message?: string
    buttonText?: string
    onClose: () => void
}

export default function AuthErrorDialog({
    isOpen,
    message = '',
    buttonText = '返回註冊頁重新嘗試',
    onClose,
}: ErrorModalProps) {
    const { isLoggingIn } = useAuthStatus()

    const navigate = useNavigate()

    const handleClick = () => {
        navigate(PATHS.LAUNCH)
    }

    return (
        <Backdrop isOpen={isOpen} position="fixed" background={'bg-black/75'}>
            <div className="flex items-center justify-center w-full h-full p-4">
                <div className="p-12 flex flex-col justify-center items-center bg-white/80 relative text-black text-[15px] tracking-wider gap-12 rounded-lg">
                    <GrFormClose
                        className="absolute cursor-pointer top-4 right-4"
                        size={24}
                        onClick={onClose}
                    />
                    <div className="flex flex-col w-full py-2 gap-5">
                        <p>親愛的用戶：</p>
                        <p>{message}</p>
                    </div>
                    {!isLoggingIn && (
                        <button
                            className="w-full max-w-[280px] px-4 py-3 bg-[#FF892A] rounded-lg text-white font-bold tracking-wider text-lg"
                            onClick={handleClick}
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            </div>
        </Backdrop>
    )
}
