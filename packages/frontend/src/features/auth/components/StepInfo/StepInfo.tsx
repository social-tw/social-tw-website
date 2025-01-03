import { clsx } from 'clsx'

interface StepInfoProps {
    hashUserId: string | null
}

export default function StepInfo({ hashUserId }: StepInfoProps) {
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
                <div className="flex flex-col items-center justify-center text-sm tracking-wide text-white ">
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
                <div className="flex flex-col items-center justify-center text-sm tracking-wide text-white ">
                    <span>錢包註冊</span>
                    <span>Or 直接註冊</span>
                </div>
            </div>
        </>
    )
}
