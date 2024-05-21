import { motion } from 'framer-motion'
import LogoWhite from '@/assets/img/logo-white.png'
import { getVariantAutoScrollY } from '@/utils/motionVariants'

export function GreetingLogo() {
    const variantAutoScrollY = getVariantAutoScrollY()
    return (
        <motion.img
            src={LogoWhite}
            alt="UniRep Logo"
            className="w-[7.5rem] mb-2"
            variants={variantAutoScrollY}
            initial="hidden"
            animate="visible"
        />
    )
}
