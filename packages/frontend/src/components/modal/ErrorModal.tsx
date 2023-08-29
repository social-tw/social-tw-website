import React from 'react'
import Modal from './Modal'
import { GrFormClose } from 'react-icons/gr'
import { useUser } from '../../contexts/User'
import LoginButton from '../login/LoginButton'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@uidotdev/usehooks'

interface ErrorModalProps {
    isOpen: boolean
}

const ErrorModal: React.FC<ErrorModalProps> = ({
    isOpen
}) => {
    const { signupStatus, setSignupStatus } = useUser()
    const navigate = useNavigate()
    const handleClick = () => {
        setSignupStatus('default')
        navigate('/login')
    }

    return (
        <Modal isOpen={isOpen} postion='fixed' opacity={100}>
            <div className='flex items-center justify-center w-full h-full px-4'>
                <div className='p-12 flex flex-col justify-center items-center bg-white relative text-black text-[15px] tracking-wider gap-12 rounded-lg'>
                    <GrFormClose
                        className='absolute top-3 right-3 cursor-pointer'
                        size={24}
                        onClick={handleClick}
                    />
                    <div className='flex flex-col justify-center gap-6'>
                        <p>
                            親愛的用戶：
                        </p>

                        {signupStatus === 'error' ? (
                            <p>很抱歉通知您，您註冊失敗，請返回註冊頁再次嘗試註冊，謝謝您！</p>
                        ) : (
                            <p>很抱歉通知您，您尚未登陸帳號，請返回註冊頁再次嘗試註冊，謝謝您！</p>
                        )
                        }

                    </div>
                    <button
                        className='w-full py-4 bg-[#FF892A] rounded-lg text-white font-bold tracking-wider text-lg'
                        onClick={handleClick}
                    >
                        返回註冊頁重新嘗試
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ErrorModal
