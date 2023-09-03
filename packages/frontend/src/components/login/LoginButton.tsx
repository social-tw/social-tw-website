import { useMediaQuery } from '@uidotdev/usehooks'
import { clsx } from 'clsx'
import React from 'react'
import { IconType, icons } from 'react-icons'

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
    color,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading}
            className={clsx(
                `
            flex
            w-full
            max-w-[44rem]
            justify-center
            items-center
            rounded-xl
            bg-[${color}]
            py-4
            text-white
            focus:outline-offset-0
            bg-opacity-70
            transition 
            duration-300 
            ease-in-out
            `,
                Icon ? 'flex-row gap-4' : 'flex-col'
            )}
        >
            {Icon && <Icon size={32} />}
            <span className="text-white font-semibold text-2xl tracking-wider">
                {title}
            </span>
            <span className="text-xs tracking-wider">{subTitle}</span>
        </button>
    )
}

export default LoginButton
