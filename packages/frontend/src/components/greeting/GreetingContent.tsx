import { motion } from 'framer-motion'
import { getVariantAutoScrollY } from '../../utils/motionVariants'

export function GreetingContent() {
    const variantAutoScrollY = getVariantAutoScrollY()
    return (
        <motion.h2
            className="text-sm font-light tracking-wider text-center text-white mt-9"
            variants={variantAutoScrollY}
            initial="hidden"
            animate="visible"
        >
            嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
            提供你 100% 匿名身份、安全發言的社群！
        </motion.h2>
    )
}
