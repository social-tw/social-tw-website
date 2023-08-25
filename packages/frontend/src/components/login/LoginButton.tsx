import { clsx } from 'clsx';
import React from 'react'
import { IconType, icons } from 'react-icons';

interface LoginButtonProps {
    icon?: IconType
    text?: string
    isLoading: boolean
    onClick?: () => void
    title: string
    subTitle?: string
    color: string
    setNoteStatus?: () => void
}

// TODO: signup with wallet and without wallet
const LoginButton: React.FC<LoginButtonProps> = ({
    icon: Icon,
    text,
    onClick,
    isLoading,
    title,
    subTitle,
    color,
    setNoteStatus
}) => {
    return (
        <button
            type='button'
            onClick={onClick}
            disabled={isLoading}
            className={`
        flex
        flex-col
        w-4/5
        justify-center
        items-center
        rounded-xl
        bg-[${color}]
        py-4
        text-white
        hover:bg-gray-500
        focus:outline-offset-0
        bg-opacity-70
        `}
        >
            <span className='text-white font-semibold text-2xl tracking-wider'>{title}</span>
            <span className='text-xs tracking-wider'>{subTitle}</span>
        </button>
    )
}

export default LoginButton
