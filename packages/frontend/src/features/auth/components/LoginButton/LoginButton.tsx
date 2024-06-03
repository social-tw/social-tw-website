import { clsx } from 'clsx'
import { IconType } from 'react-icons'

interface LoginButtonProps {
    icon?: IconType
    iconSize?: number
    isLoading?: boolean
    onClick?: () => void
    title: string
    subTitle?: string
    color: string
    start?: boolean
    text: string
}

export default function LoginButton({
    icon: Icon,
    onClick,
    isLoading = false,
    title,
    subTitle,
    color,
    start,
    text,
    iconSize,
}: LoginButtonProps) {
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