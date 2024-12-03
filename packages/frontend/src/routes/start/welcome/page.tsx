import LogoWhite from '@/assets/img/logo-white.png'
import { PATHS } from '@/constants/paths'
import { WelcomePostList } from '@/features/post'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function WelcomePage() {
    const navigate = useNavigate()

    return (
        <>
            <header className="fixed z-40 w-screen top-16 md:top-24">
                <div className="flex flex-col items-center max-w-2xl px-4 mx-auto">
                    <motion.img
                        src={LogoWhite}
                        alt="UniRep Logo"
                        className="w-30 h-30"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        transition={{
                            duration: 1,
                        }}
                    />
                    <motion.h1
                        className="mt-3 text-2xl font-semibold text-neutral-200"
                        initial={{
                            opacity: 0,
                            y: 100,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 1,
                            delay: 0.5,
                        }}
                    >
                        Unirep Social TW
                    </motion.h1>
                    <motion.p
                        className="text-sm font-light leading-loose tracking-wider text-center text-white mt-9"
                        initial={{
                            opacity: 0,
                            y: 100,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 1,
                            delay: 1,
                        }}
                    >
                        嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
                        提供你 100% 匿名身份、安全發言的社群！
                    </motion.p>
                </div>
            </header>
            <main className="max-w-2xl min-h-screen px-4 mx-auto py-96 md:py-[26rem] md:px-9">
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 1,
                        delay: 1.5,
                    }}
                >
                    <WelcomePostList />
                </motion.div>
            </main>
            <footer className="fixed z-40 w-screen px-4 bottom-8 md:bottom-28">
                <motion.div
                    className="max-w-2xl px-4 mx-auto space-y-5 md:px-0"
                    initial={{
                        opacity: 0,
                        y: 100,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 1,
                        delay: 2,
                    }}
                >
                    <button
                        className="flex flex-col items-center justify-center w-full p-4 tracking-wider text-white rounded-xl bg-secondary focus:outline-offset-0"
                        type="button"
                        onClick={() => navigate(PATHS.LOGIN)}
                    >
                        <span className="text-2xl font-semibold">立即登入</span>
                        <span className="text-xs">歡迎提供你的獨到見解！</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center w-full p-4 tracking-wider text-white rounded-xl bg-primary focus:outline-offset-0"
                        type="button"
                        onClick={() => navigate(PATHS.SIGN_UP)}
                    >
                        <span className="text-2xl font-semibold">立即註冊</span>
                        <span className="text-xs">
                            只要兩步驟，即可安全匿名分享你的想法！
                        </span>
                    </button>
                </motion.div>
            </footer>
        </>
    )
}
