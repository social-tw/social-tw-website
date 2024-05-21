import { motion } from 'framer-motion'
import Logo from '@/assets/img/logo.png'
import Backdrop from '@/components/common/Backdrop'
import { useMediaQuery } from '@uidotdev/usehooks'

interface TransactionModalProps {
    isOpen: boolean
}

export default function PostPublishTransition({
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
            <div className="flex items-center justify-center w-full h-full">
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
                </div>
            </div>
        </Backdrop>
    )
}
