import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { BsTwitter } from 'react-icons/bs'
import { GrFormClose } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'
import { SERVER } from '@/config'
import { useUser } from '@/contexts/User'
import useLoginWithServer from '@/hooks/useLoginWithServer'
import useLoginWithWallet from '@/hooks/useLoginWithWallet'
import useSignupWithServer from '@/hooks/useSignupWithServer'
import useSignUpWithWallet from '@/hooks/useSignupWithWallet'
import useTwitterVerify from '@/hooks/useTwitterVerify'
import { useMediaQuery } from '@uidotdev/usehooks'
import AuthNoteDialog from './AuthNoteDialog'
import LoginButton from './LoginButton'

interface AuthFormProps {
    accessToken: string | null
    hashUserId: string | null
    signMsg: string | null
    status: string | null
    method: string
    isShow: boolean
    onSignup: () => void
    onLogin: () => void
    handleClick: () => void
}

type NoteStatus = 'close' | 'metamask' | 'server'

const AuthForm: React.FC<AuthFormProps> = ({
    accessToken,
    hashUserId,
    signMsg,
    status,
    method,
    isShow,
    onSignup,
    onLogin,
    handleClick,
}) => {
    const navigate = useNavigate()
    const {
        setSignupStatus,
        signupStatus,
        handleWalletSignMessage,
        signup,
        setIsLogin,
        createUserState,
        setErrorCode,
    } = useUser()
    const [noteStatus, setNoteStatus] = useState<NoteStatus>('close')
    const twitterVerify = useTwitterVerify(SERVER, method)

    const signupWithWallet = useSignUpWithWallet(
        accessToken,
        hashUserId,
        navigate,
        setSignupStatus,
        setErrorCode,
        handleWalletSignMessage,
        signup,
        setIsLogin,
        createUserState
    )

    const signupWithServer = useSignupWithServer(
        accessToken,
        hashUserId,
        signMsg,
        navigate,
        setSignupStatus,
        setErrorCode,
        signup,
        setIsLogin,
        createUserState
    )

    const loginWithServer = useLoginWithServer(
        accessToken,
        hashUserId,
        signMsg,
        navigate,
        setErrorCode,
        setIsLogin,
        createUserState
    )

    const loginWithWallet = useLoginWithWallet(
        accessToken,
        hashUserId,
        navigate,
        setErrorCode,
        handleWalletSignMessage,
        setIsLogin,
        createUserState
    )

    const authVarients = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0,
                duration: 0.5,
                ease: 'easeInOut',
            },
        },
    }

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    const secondStepContent = (
        <div
            className={clsx(
                `w-full flex items-center justify-center gap-8`,
                isSmallDevice && 'flex-col'
            )}
        >
            {isShow && (
                <div className="flex flex-col items-center justify-center w-full gap-2">
                    <LoginButton
                        isLoading={signupStatus === 'pending'}
                        onClick={handleClick}
                        title="前往註冊頁進行註冊"
                        color="#DB7622"
                        text="2xl"
                    />
                </div>
            )}
            {status !== '3' && !isShow && (
                <div className="w-full flex flex-col justify-center items-center gap-2 max-w-[500px]">
                    {method === 'login' && (
                        <p className="text-white tracking-wide text-[15px] mb-5 px-2">
                            您當時註冊時選擇為「錢包註冊」，因此這步驟請使用此方式登入。若需要更改登入方式，請返回上一頁使用其他
                            Twitter 帳號註冊
                        </p>
                    )}
                    <LoginButton
                        isLoading={signupStatus === 'pending'}
                        onClick={
                            method === 'login'
                                ? loginWithWallet
                                : signupWithWallet
                        }
                        title={method === 'login' ? '錢包登入' : '錢包註冊'}
                        subTitle={
                            method === 'login'
                                ? '使用 MetaMask 錢包進行登入'
                                : '使用 MetaMask 錢包進行註冊'
                        }
                        color="#2F9CAF"
                        text="2xl"
                    />
                    <p
                        className="text-sm text-[#868D8F] cursor-pointer hover:underline"
                        onClick={() => setNoteStatus('metamask')}
                    >
                        什麼是
                        <span className="text-[#52ACBC]"> MetaMask 錢包 </span>?
                    </p>
                </div>
            )}
            {status !== '2' && !isShow && (
                <div className="w-full flex flex-col justify-center items-center gap-2 max-w-[500px]">
                    {method === 'login' && (
                        <p className="text-white tracking-wide text-[15px] mb-5 px-2">
                            您當時註冊時選擇為「直接註冊」，因此這步驟請使用此方式登入。若需要更改登入方式，請返回上一頁使用其他
                            Twitter 帳號註冊
                        </p>
                    )}
                    <LoginButton
                        isLoading={signupStatus === 'pending'}
                        onClick={
                            method === 'login'
                                ? loginWithServer
                                : signupWithServer
                        }
                        title={method === 'login' ? '直接登入' : '直接註冊'}
                        subTitle={
                            method === 'login'
                                ? '使用 Server 登入'
                                : '沒有錢包嗎? 沒關係! 可以直接使用 Server 註冊'
                        }
                        color="#DB7622"
                        text="2xl"
                    />
                    <p
                        className="text-sm text-[#868D8F] cursor-pointer hover:underline"
                        onClick={() => setNoteStatus('server')}
                    >
                        什麼是
                        <span className="text-[#52ACBC]"> Server 註冊 </span>?
                    </p>
                </div>
            )}
        </div>
    )

    const firtStepContent =
        method === '' ? (
            <>
                <LoginButton
                    isLoading={signupStatus === 'pending'}
                    onClick={onLogin}
                    title="立即登入"
                    subTitle="歡迎提供你的獨到見解！"
                    color="#2F9CAF"
                    text="2xl"
                />
                <LoginButton
                    isLoading={signupStatus === 'pending'}
                    onClick={onSignup}
                    title="立即註冊"
                    subTitle="只要兩步驟，即可安全匿名分享你的想法！"
                    color="#FF892A"
                    text="2xl"
                />
            </>
        ) : (
            <>
                <LoginButton
                    isLoading={signupStatus === 'pending'}
                    icon={BsTwitter}
                    onClick={twitterVerify}
                    title={
                        method === 'login'
                            ? '使用 Twitter 帳號登入'
                            : '使用 Twitter 帳號註冊'
                    }
                    color="#2F9CAF"
                    text="2xl"
                    iconSize={32}
                />
            </>
        )

    return (
        <>
            <motion.div
                className="md:pb-28 pb-8 min-w-[19rem] w-11/12 flex flex-col justify-center items-center gap-6 z-40"
                variants={authVarients}
                initial="hidden"
                animate="visible"
            >
                {hashUserId ? secondStepContent : firtStepContent}
            </motion.div>
            <AuthNoteDialog
                icon={GrFormClose}
                noteStatus={noteStatus}
                onClose={() => setNoteStatus('close')}
            />
        </>
    )
}

export default AuthForm
