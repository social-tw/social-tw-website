import React, { useContext, useEffect, useState } from 'react'
import { BsTwitter } from 'react-icons/bs'
import LoginButton from './LoginButton'
import { UserContext } from '../../contexts/User'
import { motion } from 'framer-motion'
import { SERVER } from '../../config'
import useTwitterVerify from '../../hooks/useTwitterVerify'
import useSignUpWithWallet from '../../hooks/useSignupWithWallet'
import useSignupWithServer from '../../hooks/useSignupWithServer'
import { observer } from 'mobx-react-lite'
import { useSearchParams } from 'react-router-dom'

// TODO: Twitter auto login: when user has login twitter but haven't signed up
// TODO: redirect bug: when user have to loggin with twitter it redirect to twitter
// TODO: twitter login form is ugly
const AuthForm: React.FC = observer(() => {
    const userContext = useContext(UserContext)
    const [searchParams] = useSearchParams()
    const hashUserId = searchParams.get('code')
    const [isLoading, setIsLoading] = useState(false)
    const twitterVerify = useTwitterVerify(setIsLoading, SERVER)
    const signupWithWallet = useSignUpWithWallet(
        hashUserId,
        userContext,
        setIsLoading
    )
    const signupWithServer = useSignupWithServer(
        hashUserId,
        SERVER,
        userContext,
        setIsLoading
    )

    const authVarients = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 2,
                duration: 1,
                ease: 'easeInOut',
            },
        },
    }

    return (
        <motion.div
            className="md:pb-0 pb-8 md:w-auto min-w-[300px] w-full flex flex-col justify-center items-center gap-6"
            variants={authVarients}
            initial="hidden"
            animate="visible"
        >
            {hashUserId ? (
                <>
                    <LoginButton
                        isLoading={isLoading}
                        icon={BsTwitter}
                        onClick={signupWithWallet}
                        title="錢包註冊"
                        subTitle="使用MetaMask錢包進行登入！"
                        color="#2F9CAF"
                    />
                    <LoginButton
                        isLoading={isLoading}
                        icon={BsTwitter}
                        onClick={signupWithServer}
                        title="直接註冊"
                        subTitle="使用SERVER進行登入！"
                        color="#DB7622"
                    />
                </>
            ) : (
                <>
                    <LoginButton
                        isLoading={isLoading}
                        icon={BsTwitter}
                        onClick={twitterVerify}
                        title="立即註冊"
                        subTitle="加入我們的匿名討論行列！"
                        color="#2F9CAF"
                    />
                </>
            )}
        </motion.div>
    )
})

export default AuthForm
