// Button.tsx

import React from 'react'
import { useContext } from 'react'
import { UserContext } from '../../contexts/User'

interface ButtonProps {
    color: string
    text: string
}

const Button: React.FC<ButtonProps> = ({ color, text }) => {
    return (
        <button
            className={`sm:w-full sm:max-w-md px-4 py-2 rounded-md text-m text-white font-bold ${color} tracking-widest`}
        >
            {text}
        </button>
    )
}

export default Button
