import Logo from '@/assets/img/logo.png'
import { Backdrop } from '@/features/shared'
import { useMediaQuery } from '@uidotdev/usehooks'
import { motion } from 'framer-motion'
import { AiOutlineClose } from 'react-icons/ai'

interface TransactionModalProps {
    onClose: () => void
    isOpen: boolean
}

export default function PostPublishTransition({
    onClose,
    isOpen,
}: TransactionModalProps) {
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

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <Backdrop isOpen={isOpen} position="fixed" background={'bg-black/70'}>
            <div className="flex items-center justify-center w-full h-full relative">
                <div className="flex flex-col gap-8">
                    <div className="flex justify-center gap-2">
                        <img
                            src={Logo}
                            alt="logo"
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
                                    aria-label="dot"
                                ></motion.span>
                            ))}
                        </div>
                    </div>
                    <div className="text-base tracking-wide text-center text-white">
                        <p>
                            您的貼文正在存取發佈中，
                            <br />
                            五秒後將跳轉至首頁。
                            <br />
                            為維護匿名性，存取發佈的執行會需要些時間。
                            <br />
                            可留意{isSmallDevice ? '上方' : '右下方'}
                            存取進度條以確認存取進度。
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="
                            flex items-center justify-center 
                            w-8 h-8 rounded-full 
                            hover:bg-gray-100 transition 
                            absolute top-2 left-2
                            bg-white
                        "
                        aria-label="Close"
                    >
                        <AiOutlineClose className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </Backdrop>
    )
}
