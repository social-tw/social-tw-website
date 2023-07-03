import React from "react";

interface ButtonProps {
    color: string;
    text: string;
}

const Button: React.FC<ButtonProps> = ({ color, text }) => {
    return (
        <button className={`sm:w-full sm:max-w-md p-3 rounded-md text-m text-white font-bold ${color} tracking-widest`}>
            {text}
        </button>
    );
}

export default Button;
