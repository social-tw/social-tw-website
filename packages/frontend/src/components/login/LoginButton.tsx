import { clsx } from 'clsx'
import React from 'react'
import { IconType } from 'react-icons'

interface LoginButtonProps {
    icon?: IconType
    iconSize?: number
    isLoading: boolean
    onClick?: () => void
    title: string
    subTitle?: string
    color: string
    start?: boolean
    text: string
}

// TODO: signup with wallet and without wallet
const LoginButton: React.FC<LoginButtonProps> = ({
    icon: Icon,
    onClick,
    isLoading,
    title,
    subTitle,
    color,
    start,
    text,
    iconSize,
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
                items-center
                rounded-xl
                bg-[${color}]
                p-4
                text-white
                focus:outline-offset-0
                bg-opacity-70
                transition 
                duration-300 
                ease-in-out
                `,
                Icon ? 'flex-row gap-2' : 'flex-col',
                start ? 'justify-start' : 'justify-center',
            )}
            style={{ backgroundColor: color }}
        >
            {Icon && <Icon size={iconSize} />}
            <span
                className={clsx(
                    `text-white 
                font-semibold 
                text-${text} 
                tracking-wider
                `,
                    Icon && 'mt-1',
                )}
            >
                {title}
            </span>
            <span className="text-xs tracking-wider">{subTitle}</span>
        </button>
    )
}

export default LoginButton
