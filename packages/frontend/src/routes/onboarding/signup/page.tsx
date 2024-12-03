import {
    BackToWelcomeButton,
    Greeting,
    StepInfo,
    TwitterSignupButton,
} from '@/features/auth'
import { getVariantOpacityZeroToOne } from '@/utils/helpers/motionVariants'
import { motion } from 'framer-motion'

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
                <section className="max-w-lg p-5 bg-white rounded-xl md:p-6">
                    <p className="text-xs leading-6 tracking-wider">
                        X 帳號僅用於
                        <span className="text-secondary">
                            驗證你是否為真實用戶
                        </span>
                        ，以防止大量假帳號帶來的女巫攻擊風險，女巫攻擊（Sybil
                        Attack）是一種常見於去中心化系統中的攻擊方式，指的是攻擊者創建大量假帳號或身份，以此來操控系統或影響網絡中的決策），從而保護平台系統安全。Unirep
                        Social Taiwan 不會取用你在 X 上的任何資訊。
                    </p>
                </section>
            </motion.div>
        </div>
    )
}
