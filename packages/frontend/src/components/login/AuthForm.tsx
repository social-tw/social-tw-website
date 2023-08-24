import React, { useContext, useEffect, useState } from 'react'
import { BsTwitter } from 'react-icons/bs'
import LoginButton from './LoginButton'
import { motion } from 'framer-motion'
import { SERVER } from '../../config'
import useTwitterVerify from '../../hooks/useTwitterVerify'
import useSignUpWithWallet from '../../hooks/useSignupWithWallet'
import useSignupWithServer from '../../hooks/useSignupWithServer'
import { useNavigate, useSearchParams } from 'react-router-dom'
import NoteModal from '../modal/NoteModal'
import { GrFormClose } from 'react-icons/gr'
import { useUser } from '../../contexts/User'

interface AuthFormProps {
    hashUserId: string | null
    method: string
    onSignup: () => void
    onLogin: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({
    hashUserId,
    method,
    onSignup,
    onLogin,
}
) => {
    const navigate = useNavigate()
    const { setIsSignupLoading, isSignupLoading, handleServerSignMessage, handleWalletSignMessage, signup } = useUser()
    const [noteStatus, setNoteStatus] = useState('close')
    const twitterVerify = useTwitterVerify(SERVER)
    const signupWithWallet = useSignUpWithWallet(navigate, setIsSignupLoading, handleWalletSignMessage, signup)
    const signupWithServer = useSignupWithServer(navigate, setIsSignupLoading, handleServerSignMessage, signup)

    const authVarients = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 1,
                duration: 1,
                ease: "easeInOut",
            },
        },
    }

    const sendSignupStepContent =
        <>
            <LoginButton
                isLoading={isSignupLoading}
                onClick={signupWithWallet}
                title='錢包註冊'
                subTitle='使用 MetaMask 錢包進行登入'
                color='#2F9CAF'
                text='MetaMask 錢包'
                setNoteStatus={() => setNoteStatus('metamask')}
            />
            <LoginButton
                isLoading={isSignupLoading}
                onClick={signupWithServer}
                title='直接註冊'
                subTitle='沒有錢包嗎? 沒關係! 可以直接使用 Server 註冊'
                color='#DB7622'
                text='Server 註冊'
                setNoteStatus={() => setNoteStatus('server')}
            />
        </>

    const firtSignupStepContent = method === '' ?
        (
            <>
                <LoginButton
                    isLoading={isSignupLoading}
                    onClick={() => { }}
                    title='立即登入'
                    subTitle='歡迎提供你的獨到見解！'
                    color='#2F9CAF'
                />
                <LoginButton
                    isLoading={isSignupLoading}
                    onClick={onSignup}
                    title='立即註冊'
                    subTitle='只要兩步驟，即可安全匿名分享你的想法！'
                    color='#FF892A'
                />
            </>
        )
        :
        (
            <>
                <LoginButton 
                    isLoading={isSignupLoading}
                    icon={BsTwitter}
                    onClick={twitterVerify}
                    title='使用 Twitter 帳號登入'
                    subTitle='歡迎提供你的獨到見解！'
                    color='#2F9CAF'
                />
            </>
        )

    return (
        <>
            <motion.div
                className="md:pb-28 pb-8 min-w-[300px] w-full flex flex-col justify-center items-center gap-6 "
                variants={authVarients}
                initial="hidden"
                animate="visible"
            >
                {hashUserId ? sendSignupStepContent : firtSignupStepContent}
            </motion.div>
            <NoteModal
                icon={GrFormClose}
                noteStatus={noteStatus}
                onClose={() => setNoteStatus('close')}
            />
        </>
    )
}

export default AuthForm

