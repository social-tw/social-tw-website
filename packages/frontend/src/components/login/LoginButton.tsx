import React, { useContext, useMemo } from 'react'
import { useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import { User, UserContext } from '../../contexts/User'

interface LoginButtonProps {
    icon: IconType
    isLoading: boolean
    onClick: () => void
    text: string
}

const LoginButton: React.FC<LoginButtonProps> = ({
    icon: Icon,
    onClick,
    isLoading,
    text
}) => {
    return (
        <button
            type='button'
            onClick={onClick}
            disabled={isLoading}
            className='
        inline-flex
        w-full
        justify-center
        items-center
        gap-4
        rounded-md
        bg-blue-400
        px-4
        py-2
        text-white
        hover:bg-gray-500
        focus:outline-offset-0
      '
        >
            <Icon size={20}/>
            <span className='mt-[1px]'>{text}</span>
        </button>
    )
}

export default LoginButton