import { clsx } from 'clsx'
import { IconType } from 'react-icons'

interface CyanButtonProps {
    icon?: IconType
    iconSize?: number
    isLoading: boolean
    onClick?: () => void
    title: string
    subTitle?: string
    start?: boolean
    size: string
}

export default function CyanButton({
    icon: Icon,
    onClick,
    isLoading,
    title,
    subTitle,
    start,
    size,
    iconSize,
}: CyanButtonProps) {
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
                bg-secondary
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
        >
            {Icon && <Icon size={iconSize} />}
            <span
                className={clsx(
                    `
                    text-white 
                    font-semibold 
                    text-${size} 
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
