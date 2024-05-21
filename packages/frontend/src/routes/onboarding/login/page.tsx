import { motion } from 'framer-motion'
import { TwitterLoginButton, BackToWelcomeButton } from '@/features/auth'
import { getVariantAutoScrollY } from '@/utils/helpers/motionVariants'
import { Greeting } from '@/features/auth'

export default function LoginPage() {
    const variantAutoScrollY = getVariantAutoScrollY()

    return (
        <div className="flex flex-col items-center h-full">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <Greeting />
                <BackToWelcomeButton />
            </div>
            <motion.div
                className="md:pb-28 pb-8 min-w-[19rem] w-11/12 flex flex-col justify-center items-center gap-6 z-40"
                variants={variantAutoScrollY}
                initial="hidden"
                animate="visible"
            >
                <TwitterLoginButton />
            </motion.div>
        </div>
    )
}
