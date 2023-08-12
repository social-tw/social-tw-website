import React from 'react'
import { IconType } from 'react-icons';

interface LoginButtonProps {
    icon?: IconType
    isLoading: boolean
    onClick?: () => void
    title: string
    subTitle?: string
    color: string
}

// TODO: signup with wallet and without wallet
const LoginButton: React.FC<LoginButtonProps> = ({
    icon: Icon,
    onClick,
    isLoading,
    title,
    subTitle,
    color
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
        max-w-[650px]
        justify-center
        items-center
        rounded-xl
        bg-[${color}]
        py-4
        text-white
        hover:bg-gray-500
        focus:outline-offset-0
        bg-opacity-70
        drop-shadow-md
        drop-shadow-black
        `}
        >
            <span className='text-white font-semibold text-2xl tracking-wider'>{title}</span>
            <span className='text-xs tracking-wider'>{subTitle}</span>
        </button>
    )
}

export default LoginButton
