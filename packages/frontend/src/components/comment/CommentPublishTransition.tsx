import { motion } from "framer-motion";
import React from "react";
import Comment from "@/assets/comment.png";
import Backdrop from "@/components/common/Backdrop";

interface TransactionModalProps {
    isOpen: boolean
}

const CommentPublishTransition: React.FC<TransactionModalProps> = ({ isOpen }) => {
    const items = [1, 2, 3]
    const variants = {
        animate: (i: number) => ({
            y: [0, -12, 0],
            transition: {
                delay: i * 0.5,
                duration: 1,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 1.5,
            },
        }),
    }

    return (
        <Backdrop isOpen={isOpen} position="fixed" background={'bg-black/70'}>
            <div className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col gap-8">
                    <div className="flex justify-center gap-2">
                        <img
                            src={Comment}
                            alt="Comment"
                            className="w-[120px] h-[120px]"
                        />
                        <div className="flex items-end gap-2">
                            {items.map((i) => (
                                <motion.span
                                    key={i}
                                    className="block w-4 h-4 bg-white rounded"
                                    custom={i}
                                    variants={variants}
                                    animate="animate"
                                ></motion.span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 text-lg tracking-wide text-white">
                        <h4>您的留言正在發布中，</h4>
                        <h4>請留意留上方資訊並確認存取狀態</h4>
                    </div>
                </div>
            </div>
        </Backdrop>
    )
}

export default CommentPublishTransition
