import React from 'react'
import Modal from '../../Modal'
import Comment from '../../../../assets/comment.png'
import { motion } from 'framer-motion'

interface TransactionModalProps {
    isOpen: boolean
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen }) => {
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
        <Modal isOpen={isOpen} postion="fixed" background={'bg-black/70'}>
            <div className="w-full h-full flex justify-center items-center">
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
                    <div className="flex flex-col gap-2 items-center justify-center text-lg tracking-wide text-white">
                        <h4>您的留言正在發布中，</h4>
                        <h4>請留意留上方資訊並確認存取狀態</h4>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default TransactionModal
