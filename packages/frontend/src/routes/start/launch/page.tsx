import LogoWhite from '@/assets/img/logo-white.png'
import { CyanButton } from '@/features/auth'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

export default function LaunchPage() {
    const navigate = useNavigate()

    const goToFeatures = () => {
        navigate('/features')
    }

    const goToAboutPage = () => {
        navigate('/about')
    }

    return (
        <main className="flex flex-col items-center justify-center w-screen h-screen gap-2">
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
            <section className="flex items-center justify-center w-full max-w-xl mt-8">
                <motion.div
                    className="flex flex-col items-center justify-center max-w-xl gap-4 w-80"
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
                    <CyanButton
                        isLoading={false}
                        size="lg"
                        title="查看平台詳細說明"
                        onClick={goToAboutPage}
                    />
                    <Link
                        to="/welcome"
                        className="text-sm text-white underline"
                    >
                        直接前往登入或註冊
                    </Link>
                </motion.div>
            </section>
        </main>
    )
}
