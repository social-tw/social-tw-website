import { motion } from 'framer-motion'
import { useMediaQuery } from '@uidotdev/usehooks'
import BackToWelcomePageButton from '../../components/buttons/BackToWelcomeButton'
import { TwitterLoginButton } from '../../components/buttons/TwitterButton'
import { GreetingContent } from '../../components/greeting/GreetingContent'
import { GreetingContentOnSmallDevice } from '../../components/greeting/GreetingContentOnSmallDevice'
import { GreetingLogo } from '../../components/greeting/GreetingLogo'
import { GreetingTitle } from '../../components/greeting/GreetingTitle'
import { getVariantAutoScrollY } from '../../utils/motionVariants'

export function Login() {
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
    const variantAutoScrollY = getVariantAutoScrollY()

    return (
        <div className="flex flex-col items-center h-full">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <div className="flex flex-col gap-12">
                    {!isSmallDevice && (
                        <div className="flex flex-col items-center justify-center pt-24">
                            <GreetingLogo />
                            <GreetingTitle />
                            <GreetingContent />
                        </div>
                    )}
                    {isSmallDevice && <GreetingContentOnSmallDevice />}
                </div>
                <BackToWelcomePageButton />
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
