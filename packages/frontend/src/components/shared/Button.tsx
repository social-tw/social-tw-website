import React from "react";

interface ButtonProps {
    color: string;
    text: string;
}

const Button: React.FC<ButtonProps> = ({ color, text }) => {
    return (
        <button className={`w-[142px] h-[53px] rounded-xl text-[20px] text-white font-inter font-semibold ${color}`}>
            {text}
        </button>
    );
}

export default Button;
