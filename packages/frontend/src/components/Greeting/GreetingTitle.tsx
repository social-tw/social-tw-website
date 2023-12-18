import { motion } from 'framer-motion'
import { getVariantAutoScrollY } from '../../utils/motionVariants'

export function GreetingTitle() {
    const variantAutoScrollY = getVariantAutoScrollY()
    return (
        <motion.h1
            className="text-2xl font-semibold text-neutral-200"
            variants={variantAutoScrollY}
            initial="hidden"
            animate="visible"
        >
            Unirep Social TW
        </motion.h1>
    )
}
