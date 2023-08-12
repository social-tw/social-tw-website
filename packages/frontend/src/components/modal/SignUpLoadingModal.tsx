import React from 'react';
import Modal from './Modal';
import { IconType } from 'react-icons';
import './signUpLoadingModal.css';
import { LoadingStatus } from '../../contexts/LoadingContext';

interface LoadingModalProps {
    icon: IconType
    status: LoadingStatus
    isOpen?: boolean
    onClose?: () => void
}

const SignUpLoadingModal: React.FC<LoadingModalProps> = ({
    icon: Icon,
    status,
    isOpen,
    onClose
}) => {
    let content;

    switch (status) {
        case 'start':
            content = (
                <>
                    <Icon size={80} className='text-white' />
                    <div className='w-8/12 h-[12px] rounded-2xl bg-[#222222] shadow-inner shadow-[#00000040] shadow-[#FFFFFF4D]' />
                    <div className='h-[108px]'>
                        <p className='text-white text-2xl font-semibold tracking-wider'>正在等待驗證...</p>
                    </div>
                </>
            );
            break;
        
        case 'loading':
            content = (
                <>
                    <Icon size={80} className='text-white' />
                    <div className='w-8/12 h-[12px] rounded-2xl bg-[#222222] shadow-inner shadow-[#00000040] shadow-[#FFFFFF4D] progress' />
                    <div className='h-[108px]'>
                        <p className='text-white text-2xl font-semibold tracking-wider'>正在進行鍊上部屬...</p>
                    </div>
                </>
            );
            break;

        case 'success':
            content = (
                <>
                    <Icon size={80} className='text-white' />
                    <div className='w-8/12 h-[12px] rounded-2xl success shadow-inner shadow-[#00000040] shadow-[#FFFFFF4D]' />
                    <div className='flex flex-col justify-center items-center gap-4 h-[108px]'>
                        <p className='text-white text-2xl font-semibold tracking-wider'>登入成功!</p>
                        <p className='text-white text-medium font-semibold tracking-wider'>正在前往 Unirep Social TW!</p>
                    </div>
                </>
            );
            break;

        case 'fail':
            content = (
                <>
                    <Icon size={80} className='text-white' />
                    <div className='w-8/12 h-[12px] rounded-2xl fail shadow-inner shadow-[#00000040] shadow-[#FFFFFF4D]' />
                    <div className='w-11/12 flex flex-col justify-center items-center gap-4'>
                        <p className='text-white text-2xl font-semibold tracking-wider'>登入失敗!</p>
                        <button 
                            className='w-full flex justify-center items-center bg-[#2F9CAF] rounded-lg py-4 cursor-pointer'
                            onClick={onClose}
                        >
                            <span className='text-white font-semibold tracking-wider text-xl'>返回登入頁重新嘗試</span>
                        </button>
                    </div>
                </>
            );
            break;
    }

    return (
        <Modal isOpen={isOpen}>
            <div className='flex flex-col justify-center items-center gap-10 w-full max-w-[350px]'>
                {content}
            </div>
        </Modal>
    );
}

export default SignUpLoadingModal;
