import { GrFormClose } from 'react-icons/gr'
import Backdrop from '../../../shared/components/Backdrop/Backdrop'
import { useLogout } from '@/features/auth/hooks/useLogout/useLogout'

interface LogoutModalProps {
    isOpen: boolean
    closeModal: () => void
}

export default function LogoutModal({ isOpen, closeModal }: LogoutModalProps) {
    const { isPending, logout } = useLogout()

    return (
        <Backdrop isOpen={isOpen} position="fixed" background={'bg-black/75'}>
            <div className="flex items-center justify-center w-full h-full p-4">
                <div className={getBoxStyle()}>
                    <GrFormClose
                        className="absolute cursor-pointer top-4 right-4"
                        size={24}
                        onClick={closeModal}
                    />
                    <div className="grid gap-8 mb-12">
                        <div>親愛的用戶：</div>
                        <div className={`text-[#2F9CAF] font-bold`}>
                            我們會將您的用戶資料進行點對點加密，以便於未來您再次登入後快速找回您的資料！
                        </div>
                        <div>
                            您確定要登出嗎？若您確認登出，歡迎隨時登入回來
                            Unirep Social TW！
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <button
                            className="w-full py-4 bg-[#FF892A] rounded-lg text-white font-bold tracking-wider text-lg"
                            onClick={() => logout()}
                            disabled={isPending}
                        >
                            確認登出
                        </button>
                        <button
                            className="w-full py-4 bg-[#FF892A] rounded-lg text-white font-bold tracking-wider text-lg"
                            onClick={closeModal}
                        >
                            取消登出
                        </button>
                    </div>
                </div>
            </div>
        </Backdrop>
    )
}

function getBoxStyle() {
    return `
        p-12
        max-w-[587px]
        bg-white 
        relative 
        text-black 
        text-[15px] 
        tracking-wider 
        rounded-lg
    `
}
