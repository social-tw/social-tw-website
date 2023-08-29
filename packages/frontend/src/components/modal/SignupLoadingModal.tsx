import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import './signupLoadingModal.css'
import { SignupStatus } from '../../contexts/User'

interface SignUpLoadingModal {
    status: SignupStatus
    isOpen: boolean
    opacity: number
    onClose?: () => void
}

const SignUpLoadingModal: React.FC<SignUpLoadingModal> = ({
    status,
    isOpen,
    opacity,
}) => {
    let content
    switch (status) {
        case 'pending':
            content = (
                <>
                    <div className='w-8/12 h-[12px] rounded-2xl progress' />
                    <p className='text-white text-lg font-semibold tracking-wider'>努力註冊中，先來看看文章吧！</p>
                </>
            )
            break

        case 'success':
            content = (
                <>
                    <div className='w-8/12 h-[12px] rounded-2xl bg-gradient-to-r from-[#52ACBC] to-[#FF892A]' />
                    <p className='text-white text-lg font-semibold tracking-wider'>註冊成功！可以 Po 文、按讚跟留言囉！</p>
                </>
            )
            break

        case 'default':
            content = (
                <>
                    <p className='text-white text-lg font-semibold tracking-wider'>您尚未登陸，無法使用發布貼文功能！</p>
                </>
            )
            break
    }

    if (status === 'error') return null
    
    return (
        <Modal isOpen={isOpen} postion='absolute' opacity={opacity}>
            <div className='flex flex-col justify-center items-center gap-1 w-full h-full'>
                {content}
            </div>
        </Modal>
    )
}

export default SignUpLoadingModal