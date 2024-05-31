import { motion } from 'framer-motion'
import { getVariantOpacityZeroToOne } from '@/utils/helpers/motionVariants'
import {
    BackToWelcomeButton,
    Greeting,
    StepInfo,
    TwitterSignupButton,
} from '@/features/auth'

export default function SignupPage() {
    const variantOpacityZeroToOne = getVariantOpacityZeroToOne()

    return (
        <div className="flex flex-col items-center h-full">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <div className="flex flex-col gap-12">
                    <Greeting />
                    <motion.div
                        className="flex justify-center"
                        variants={variantOpacityZeroToOne}
                        initial="hidden"
                        animate="visible"
                    >
                        {<StepInfo hashUserId={null} />}
                    </motion.div>
                </div>
                <BackToWelcomeButton />
            </div>
            <motion.div
                className="md:pb-28 pb-8 min-w-[19rem] w-11/12 flex flex-col justify-center items-center gap-6 z-40"
                variants={variantOpacityZeroToOne}
                initial="hidden"
                animate="visible"
            >
                <TwitterSignupButton />
            </motion.div>
        </div>
    )
}
