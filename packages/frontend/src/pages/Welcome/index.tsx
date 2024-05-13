import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GreetingContent } from '../../components/greeting/GreetingContent'
import { GreetingLogo } from '../../components/greeting/GreetingLogo'
import { GreetingTitle } from '../../components/greeting/GreetingTitle'
import LoginButton from '../../components/login/LoginButton'
import { PATHS } from '../../constants/paths'
import {
    getVariantAutoScrollY,
    getVariantOpacityZeroToOne,
} from '../../utils/motionVariants'
import ExamplePostList from './ExamplePostsList'
import WelcomeBackgroundList from '@/components/login/WelcomeBackgroundList'

export function Welcome() {
    const navigate = useNavigate()
    const variantOpacityZeroToOne = getVariantOpacityZeroToOne()
    const variantAutoScrollY = getVariantAutoScrollY()
    return (
        <div className="flex flex-col items-center h-full">
            <div className="z-20 flex flex-col w-11/12 h-full">
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col items-center justify-center md:pt-24 pt-8">
                        <GreetingLogo />
                        <GreetingTitle />
                        <GreetingContent />
                    </div>
                </div>
            </div>
            <motion.div
                className="md:pb-28 pb-8 min-w-[19rem] w-11/12 flex flex-col justify-center items-center gap-6 z-40"
                variants={variantOpacityZeroToOne}
                initial="hidden"
                animate="visible"
            >
                <LoginButton
                    onClick={() => navigate(PATHS.LOGIN)}
                    title="立即登入"
                    subTitle="歡迎提供你的獨到見解！"
                    color="#2F9CAF"
                    text="2xl"
                />
                <LoginButton
                    onClick={() => navigate(PATHS.SIGN_UP)}
                    title="立即註冊"
                    subTitle="只要兩步驟，即可安全匿名分享你的想法！"
                    color="#FF892A"
                    text="2xl"
                />
            </motion.div>
            <WelcomeBackgroundList
                method="remove-this"
                variants={variantAutoScrollY}
            >
                <div className="max-w-[600px] w-11/12">
                    <ExamplePostList />
                </div>
            </WelcomeBackgroundList>
        </div>
    )
}
