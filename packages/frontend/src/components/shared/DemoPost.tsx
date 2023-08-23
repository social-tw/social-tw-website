import React from 'react'
import { IoIosMore } from 'react-icons/io'
import { BiSolidLike, BiSolidDislike, BiCommentDetail } from 'react-icons/bi'
import { motion } from 'framer-motion'

interface DemoPostProps {
    text: string
    likes: number
    dislikes: number
    comments: number
    index: number
}

const DemoPost: React.FC<DemoPostProps> = ({
    text,
    likes,
    dislikes,
    comments,
    index,
}) => {
    const opacity = index === 1 ? 0.9 : 0.1
    const postVarient = {
        visible: { opacity: 1 },
        hidden: {
            opacity: opacity,
            transition: {
                delay: 1,
                duration: 1,
                ease: 'easeInOut',
            },
        },
    }
    return (
        <motion.div
            className="flex flex-col justify-between px-5 py-4 bg-[#FFFFFFE5] w-11/12 h-[164px] rounded-xl"
            variants={postVarient}
            initial="visible"
            animate="hidden"
        >
            <div className="flex justify-between">
                <div className="flex justify-center items-center">
                    <p className="mr-5 border-2 rounded-full border-white text-center">
                        🎃
                    </p>
                    <span className="text-[10px] text-black font-medium">
                        就在剛剛
                    </span>
                </div>
                <IoIosMore className="text-[#8F8F8F]" />
            </div>
            <p className="text-xs font-semibold">{text}...</p>
            <div className="flex gap-2">
                <div className="flex items-center gap-1">
                    <div className="text-white bg-[#DB7622] rounded-full p-[5px]">
                        <BiSolidLike className="text-sm" />
                    </div>
                    <p className="text-[10px]">{likes}</p>
                </div>
                <div className="flex items-center gap-1">
                    <div className="text-white bg-[black] rounded-full p-[5px]">
                        <BiSolidDislike className="text-sm" />
                    </div>
                    <p className="text-[10px]">{dislikes}</p>
                </div>
                <div className="flex items-center gap-1">
                    <div className="text-white bg-[#2F9CAF] rounded-full p-[5px]">
                        <BiCommentDetail className="text-sm" />
                    </div>
                    <p className="text-[10px] font-medium">{comments}</p>
                </div>
            </div>
        </motion.div>
    )
}

export default DemoPost
