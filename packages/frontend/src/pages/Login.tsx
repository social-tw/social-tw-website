import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { IoChevronBack } from 'react-icons/io5'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LogoWhite from '@/assets/logo-white.png'
import AuthErrorDialog from '@/components/login/AuthErrorDialog'
import AuthForm from '@/components/login/AuthForm'
import StepInfo from '@/components/login/StepInfo'
import WelcomeBackgroundList from '@/components/login/WelcomeBackgroundList'
import { useUser } from '@/contexts/User'
import { useMediaQuery } from '@uidotdev/usehooks'
import PostList from './PostList'

type Method = '' | 'signup' | 'login'

const Login: React.FC = () => {
    const [searchParams] = useSearchParams()
    const hashUserId = searchParams.get('code')
    const accessToken = searchParams.get('token')
    const status = searchParams.get('status')
    const signMsg = searchParams.get('signMsg')
    const navigate = useNavigate()
    const { errorCode } = useUser()
    const [method, setMethod] = useState<Method>(
        status === '1'
            ? 'signup'
            : status === '2' || status === '3'
            ? 'login'
            : ''
    )
    const [isShow, setIsShow] = useState<boolean>(false)

    const basicVarients = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: 'easeInOut',
            },
        },
    }

    const textVariants = {
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

    const postListVariants = {
        start: { y: 700 },
        end: {
            y: 0,
            transition: {
                delay: 0,
                duration: 1,
                ease: 'easeInOut',
            },
        },
    }

    const handleBack = () => {
        setMethod('')
        if (hashUserId) {
            navigate('/login', { replace: true, state: {} })
        } else {
            return
        }
    }

    useEffect(() => {
        const showParam = localStorage.getItem('showLogin')
        if (showParam === 'isShow' && method !== 'login') {
            setIsShow(true)
        } else {
            setIsShow(false)
        }
    }, [])

    const handleClick = () => {
        localStorage.removeItem('showLogin')
        setIsShow(false)
        handleBack()
    }

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <div className="flex flex-col items-center h-full">
            <AuthErrorDialog isOpen={errorCode !== ''} />
            <div
                className={clsx(
                    `z-20 flex flex-col w-11/12`,
                    method !== '' ? 'mb-6' : 'h-full'
                )}
            >
                <div className="flex flex-col gap-12">
                    {(method === '' || !isSmallDevice) && (
                        <div
                            className={clsx(
                                'flex items-center flex-col justify-center',
                                isShow ? 'pt-60' : 'pt-24'
                            )}
                        >
                            <motion.img
                                src={LogoWhite}
                                alt="UniRep Logo"
                                className="w-[7.5rem] mb-2"
                                variants={basicVarients}
                                initial="hidden"
                                animate="visible"
                            />
                            <motion.h1
                                className="text-2xl font-semibold text-neutral-200"
                                variants={textVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                Unirep Social TW
                            </motion.h1>
                            {isShow ? (
                                <motion.h2
                                    className="text-sm font-light tracking-wider text-center text-white mt-9"
                                    variants={textVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    您尚未註冊 Unirep Social TW
                                </motion.h2>
                            ) : (
                                <motion.h2
                                    className="text-sm font-light tracking-wider text-center text-white mt-9"
                                    variants={textVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
                                    提供你 100% 匿名身份、安全發言的社群！
                                </motion.h2>
                            )}
                        </div>
                    )}

                    {method !== '' && (
                        <div className="flex flex-col mt-24 text-2xl font-semibold tracking-wider text-white md:hidden">
                            {isShow ? <p>您尚未註冊</p> : <p>歡迎回到</p>}
                            <p>Unirep Social TW！</p>
                            {method === 'login' && hashUserId && !isShow && (
                                <p>再一步即可完成登入</p>
                            )}
                            {method === 'signup' && !isShow && (
                                <p>只要兩步驟即可完成註冊</p>
                            )}
                        </div>
                    )}

                    {status === '1' && !isShow && (
                        <p className="hidden text-2xl font-semibold tracking-wider text-center text-white md:block">
                            再一步即可完成註冊
                        </p>
                    )}

                    {(status === '2' || status === '3') && !isShow && (
                        <p className="hidden text-2xl font-semibold tracking-wider text-center text-white md:block">
                            再一步即可完成登入
                        </p>
                    )}

                    {method === 'signup' && !isShow && (
                        <motion.div
                            className="flex justify-center"
                            variants={basicVarients}
                            initial="hidden"
                            animate="visible"
                        >
                            {<StepInfo hashUserId={hashUserId} />}
                        </motion.div>
                    )}

                    {status === '1' && !isShow && (
                        <p className="text-white tracking-wide text-[15px] text-center">
                            選擇「錢包註冊」 / 「直接註冊」即代表未來登入的方式
                            ，無法再做更改
                        </p>
                    )}
                </div>

                {method !== '' && (
                    <div
                        className="absolute top-7 bg-[#E8ECF4] p-3 md:px-4 md:py-2 rounded-lg cursor-pointer flex justify-center items-center text-black"
                        onClick={handleBack}
                    >
                        <IoChevronBack size={16} />
                        <span className="hidden mx-2 text-sm font-bold md:block">
                            回到註冊頁
                        </span>
                    </div>
                )}
            </div>
            <AuthForm
                accessToken={accessToken}
                hashUserId={hashUserId}
                signMsg={signMsg}
                status={status}
                method={method}
                isShow={isShow}
                onSignup={() => setMethod('signup')}
                onLogin={() => setMethod('login')}
                handleClick={handleClick}
            />
            {method === '' && (
                <WelcomeBackgroundList
                    method={method}
                    variants={postListVariants}
                >
                    <PostList />
                </WelcomeBackgroundList>
            )}
        </div>
    )
}

export default Login
