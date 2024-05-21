import { useMediaQuery } from '@uidotdev/usehooks'
import { motion } from 'framer-motion'

import BackToWelcomePageButton from '../../components/buttons/BackToWelcomeButton'
import { TwitterSignupButton } from '../../components/buttons/TwitterButton'
import { GreetingContent } from '../../components/greeting/GreetingContent'
import { GreetingContentOnSmallDevice } from '../../components/greeting/GreetingContentOnSmallDevice'
import { GreetingLogo } from '../../components/greeting/GreetingLogo'
import { GreetingTitle } from '../../components/greeting/GreetingTitle'
import StepInfo from '../../components/login/StepInfo'
import { getVariantOpacityZeroToOne } from '../../utils/motionVariants'

export function Signup() {
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
    const variantOpacityZeroToOne = getVariantOpacityZeroToOne()
    return (
        <div className="flex flex-col h-full items-center">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <div className="flex flex-col gap-12">
                    {!isSmallDevice && (
                        <div className="flex items-center flex-col justify-center pt-24">
                            <GreetingLogo />
                            <GreetingTitle />
                            <GreetingContent />
                        </div>
                    )}
                    {isSmallDevice && <GreetingContentOnSmallDevice />}
                    <motion.div
                        className="flex justify-center"
                        variants={variantOpacityZeroToOne}
                        initial="hidden"
                        animate="visible"
                    >
                        {<StepInfo hashUserId={null} />}
                    </motion.div>
                </div>
                <BackToWelcomePageButton />
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
