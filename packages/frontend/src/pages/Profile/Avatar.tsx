import AvatarIcon from '@/assets/img/avatar.png'

export default function Avatar() {
    return (
        <div className="flex items-center gap-4">
            <div
                className={`
              w-[80px] h-[80px] rounded-full bg-gray-400 border-white border-4 flex items-center justify-center
              md:w-[100px] md:h-[100px]
            `}
            >
                <img src={AvatarIcon} alt="Avatar" />
            </div>
            <div className="text-white md:hidden">
                <div>Next Epoch in</div>
                <div className="text-4xl">04:11</div>
            </div>
        </div>
    )
}
