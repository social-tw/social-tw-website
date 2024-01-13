import { motion } from 'framer-motion'
import { getVariantAutoScrollY } from '../../utils/motionVariants'

export function GreetingUnregisteredHint() {
    const variantAutoScrollY = getVariantAutoScrollY()
    return (
        <motion.h2
            className="text-sm font-light tracking-wider text-center text-white mt-9"
            variants={variantAutoScrollY}
            initial="hidden"
            animate="visible"
        >
            您尚未註冊 Unirep Social TW
        </motion.h2>
    )
}
