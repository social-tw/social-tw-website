import { clsx } from 'clsx';
import React from 'react';

interface StepInfoProps {
    hashUserId: string | null;
}

const StepInfo: React.FC<StepInfoProps> = ({ hashUserId }) => {
    return (
        <>
            <div
                className="
                flex 
                w-[80px] 
                flex-col 
                justify-center 
                items-center 
                gap-2"
            >
                <div
                    className={clsx(
                        `
                        text-white 
                        w-[60px] 
                        h-[60px] 
                        flex 
                        items-center 
                        justify-center 
                        font-semibold 
                        bg-[#FF892A] 
                        rounded-full 
                        text-[30px]
                        `,
                        hashUserId && 'border-[5px] border-white',
                    )}
                >
                    1
                </div>
                <div
                    className="
                    text-white 
                    text-sm 
                    flex 
                    flex-col 
                    justify-center 
                    items-center 
                    tracking-wide"
                >
                    <span>Twitter</span>
                    <span>帳號登入</span>
                </div>
            </div>
            <div
                className="
                w-[50px] 
                mb-10 
                flex 
                justify-between 
                items-center
                "
            >
                <span className="bg-[#FF892A] h-1 w-1"></span>
                <span className="bg-[#FF892A] h-1 w-2"></span>
                <span className="bg-[#FF892A] h-1 w-2"></span>
                <span className="bg-[#FF892A] h-1 w-1"></span>
            </div>
            <div
                className={clsx(
                    `flex w-[80px] flex-col justify-center items-center gap-2`,
                    !hashUserId && 'opacity-30',
                )}
            >
                <div
                    className="
                    text-white 
                    w-[60px] 
                    h-[60px] 
                    flex 
                    items-center 
                    justify-center 
                    font-semibold 
                    bg-[#FF892A] 
                    rounded-full 
                    text-[30px]
                    "
                >
                    2
                </div>
                <div
                    className="
                    text-white 
                    text-sm 
                    flex 
                    flex-col 
                    justify-center 
                    items-center 
                    tracking-wide"
                >
                    <span>錢包註冊</span>
                    <span>Or 直接註冊</span>
                </div>
            </div>
        </>
    );
};

export default StepInfo;
