import { IconType } from 'react-icons'

interface LoginButtonProps {
    icon: IconType
    onClick: () => void
    disabled: boolean
}

const LoginButton: React.FC<LoginButtonProps> = ({
    icon: Icon,
    onClick,
    disabled,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="
        inline-flex
        w-full
        justify-center
        rounded-md
        bg-gray-100
        px-4
        py-2
        text-gray-500
        shadow-sm
        ring-1
        ring-inset
        ring-gray-300
        hover:bg-gray-300
        focus:outline-offset-0
      "
        >
            <Icon />
        </button>
    )
}

export default LoginButton
