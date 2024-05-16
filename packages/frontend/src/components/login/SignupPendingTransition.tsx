import './signupPendingTransition.css'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Backdrop from '@/components/common/Backdrop'
import { MutationKeys } from '@/constants/queryKeys'
import { useIsMutating, useMutationState } from '@tanstack/react-query'
import { useIsLogin } from '@/hooks/useIsLogin/useIsLogin'

const textsAndTimes: { text: string; time: number }[] = [
    { text: 'Unirep Social TW 是個全匿名且去中心化的社群平台', time: 7000 },
    { text: '匿名的友善互動環境還需請您一起共同守護 ：）', time: 14000 },
]

export default function SignUpLoadingModal() {
    const navigate = useNavigate()

    const onClick = () => {
        navigate('/login', { replace: true, state: {} })
    }

    const { isLoggedIn } = useIsLogin()

    const signingUpCount = useIsMutating({ mutationKey: [MutationKeys.Signup] })
    const isSigningUp = signingUpCount > 0

    const [isShowSignupLoadingTransition, setIsShowSignupLoadingTransition] =
        useState(false)

    const isPending = isSigningUp || isShowSignupLoadingTransition

    useEffect(() => {
        if (isLoggedIn) {
            setTimeout(() => {
                setIsShowSignupLoadingTransition(false)
            }, 1500)
        } else {
            setIsShowSignupLoadingTransition(true)
        }
    }, [isLoggedIn])

    const statuses = useMutationState({
        filters: {
            mutationKey: [MutationKeys.Signup],
        },
        select: (mutation) => mutation.state.status,
    })

    const status = statuses[0]

    const [pendingText, setPendingText] =
        useState('努力註冊中，先來看看文章吧！')

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

    useEffect(() => {
        if (status === 'pending') {
            const timers: NodeJS.Timeout[] = []

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

    let content
    switch (status) {
        case 'pending':
            content = (
                <>
                    <div className="w-8/12 h-[12px] rounded-2xl progress bg-[#222222]" />
                    <p className="w-11/12 text-lg font-semibold tracking-wider text-center text-white h-14">
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
                        className="w-11/12 text-lg font-semibold tracking-wider text-center text-white h-14"
                        variants={opacityVarients}
                        initial="visible"
                        animate="hidden"
                    >
                        註冊成功！可以 Po 文、按讚跟留言囉！
                    </motion.p>
                </>
            )
            break

        case 'idle' || 'error':
            content = (
                <>
                    <p className="text-lg font-semibold tracking-wider text-white">
                        註冊 / 登入後，
                    </p>
                    <p className="text-lg font-semibold tracking-wider text-white">
                        即可按讚、留言、Po文！
                    </p>
                    <button
                        className="py-4 bg-[#FF892A] rounded-lg text-white font-bold tracking-wider text-lg w-4/5 my-4"
                        onClick={onClick}
                    >
                        返回註冊/登入頁
                    </button>
                </>
            )
            break
    }

    return (
        <Backdrop
            isOpen={isPending}
            position="absolute"
            background="bg-gradient-to-t from-black/100 to-white/0"
        >
            <div
                className={clsx(
                    `flex flex-col justify-center items-center gap-2 w-full h-full`,
                    status !== 'idle' && 'md:pt-12',
                )}
            >
                {content}
            </div>
        </Backdrop>
    )
}
