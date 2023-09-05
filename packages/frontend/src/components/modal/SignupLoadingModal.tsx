import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import './signupLoadingModal.css'
import { SignupStatus } from '../../contexts/User'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useMediaQuery } from '@uidotdev/usehooks'

interface SignUpLoadingModal {
    status: SignupStatus
    isOpen: boolean
    opacity: number
    onClose?: () => void
}

const SignUpLoadingModal: React.FC<SignUpLoadingModal> = ({
    status,
    isOpen,
}) => {
    const [pendingText, setPendingText] =
        useState('努力註冊中，先來看看文章吧！')

    const textsAndTimes: { text: string; time: number }[] = [
        { text: 'Unirep Social TW 是個全匿名且去中心化的社群平台', time: 7000 },
        { text: '匿名的友善互動環境還需請您一起共同守護 ：）', time: 14000 },
    ]

    useEffect(() => {
        if (status === 'pending') {
            const timers: NodeJS.Timeout[] = []

            // Loop through the textsAndTimes array and set up timeouts
            textsAndTimes.forEach(({ text, time }) => {
                const timer = setTimeout(() => {
                    setPendingText(text)
                }, time)

                timers.push(timer)
            })

            return () => {
                timers.forEach((timer) => clearTimeout(timer))
            }
        } else return
    }, [status])

    const opacityVarients = {
        visible: { opacity: 1 },
        hidden: {
            opacity: 0,
            transition: {
                delay: 0,
                duration: 1.5,
                ease: 'easeInOut',
            },
        },
    }

    let content
    switch (status) {
        case 'pending':
            content = (
                <>
                    <div className="w-8/12 h-[12px] rounded-2xl progress bg-[#222222]" />
                    <p className="text-white text-lg font-semibold tracking-wider text-center w-11/12 h-14">
                        {pendingText}
                    </p>
                </>
            )
            break

        case 'success':
            content = (
                <>
                    <motion.div
                        className="w-8/12 h-[12px] rounded-2xl bg-gradient-to-r from-[#52ACBC] to-[#FF892A]"
                        variants={opacityVarients}
                        initial="visible"
                        animate="hidden"
                    />
                    <motion.p
                        className="text-white text-lg font-semibold tracking-wider w-11/12 h-14 text-center"
                        variants={opacityVarients}
                        initial="visible"
                        animate="hidden"
                    >
                        註冊成功！可以 Po 文、按讚跟留言囉！
                    </motion.p>
                </>
            )
            break

        case 'default':
            content = (
                <>
                    <p className="text-white text-lg font-semibold tracking-wider">
                        您尚未登入，無法使用發布貼文功能！
                    </p>
                </>
            )
            break
    }

    if (status === 'error') return null

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <Modal
            isOpen={isOpen}
            postion="absolute"
            background="bg-gradient-to-t from-black/100 to-white/0"
        >
            <div
                className={clsx(
                    `flex flex-col justify-center items-center gap-2 w-full h-full`,
                    status !== 'default' && 'md:pt-12',
                    isSmallDevice && 'mt-16'
                )}
            >
                {content}
            </div>
        </Modal>
    )
}

// background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%);

export default SignUpLoadingModal
