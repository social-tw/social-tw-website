import ShareImg from '@/assets/img/share.png'
import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'

interface ShareLinkTransitionProps {
    isOpen: boolean
}

export default function ShareLinkTransition({ isOpen }: ShareLinkTransitionProps) {
    const controls = useAnimation()

    useEffect(() => {
        if (!isOpen) return
        controls.start({
            y: [100, 0],
            opacity: [0, 1, 0],
            transition: {
                y: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 10,
                    duration: 1,
                },
                opacity: {
                    duration: 2, // Complete fade-in-out cycle
                    ease: 'easeInOut',
                },
            },
        })
    }, [controls, isOpen])

    if (!isOpen) return null

    return (
        <motion.div
            className="
                z-10 w-full h-full absolute top-0 left-0 text-white 
                flex flex-row gap-2 items-center justify-center
            "
            animate={controls}
        >
            <dialog className="bg-white flex gap-2 block p-2 rounded-lg border-gray shadow-sm">
                <img className="w-6 h-6" src={ShareImg} alt="share" />
                <span className="block">貼文連結已複製成功！</span>
            </dialog>
        </motion.div>
    )
}
