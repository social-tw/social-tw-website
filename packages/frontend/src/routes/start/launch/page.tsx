import LogoWhite from '@/assets/img/logo-white.png'
import { CyanButton } from '@/features/auth'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

export default function LaunchPage() {
    const navigate = useNavigate()
    const goToFeatures = () => {
        navigate('/features')
    }

    return (
        <main className="w-screen h-screen flex flex-col justify-center items-center gap-2">
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
                    delay: 1,
                }}
            >
                Unirep Social TW
            </motion.h1>
            <motion.p
                className="text-sm font-light leading-loose tracking-wider text-center text-white"
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
                    delay: 1.5,
                }}
            >
                嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
                提供你 100% 匿名身份、安全發言的社群！
            </motion.p>
            <section className="w-full max-w-xl flex items-center justify-center mt-8">
                <motion.div
                    className="w-80 max-w-xl flex flex-col items-center justify-center gap-2"
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
                    <CyanButton
                        isLoading={false}
                        size="lg"
                        title="查看特色簡介"
                        onClick={goToFeatures}
                    />
                    <Link
                        to="/welcome"
                        className="text-white text-sm underline"
                    >
                        直接前往登入或註冊
                    </Link>
                </motion.div>
            </section>
        </main>
    )
}
