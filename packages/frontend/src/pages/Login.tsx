import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthForm from '../components/login/AuthForm'
import { motion } from 'framer-motion'
import DemoPostList from '../components/login/DemoPostList'
import { clsx } from 'clsx'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IoChevronBack } from 'react-icons/io5'
import StepInfo from '../components/login/StepInfo'
import LogoWhite from '../assets/logo-white.png'
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
    const [method, setMethod] = useState<Method>('')
    const postListRef = useRef<HTMLDivElement>(null)

    const handleScroll = () => {
        const container = postListRef.current
        if (!container) return

        // Find the ul element that contains the li elements
        const ulElement = container.querySelector('ul')
        if (!ulElement) return

        const children = Array.from(ulElement.children) as HTMLElement[]
        const containerHeight = container.clientHeight
        const scrollPosition = container.scrollTop

        children.forEach((child) => {
            const childTop = child.offsetTop - scrollPosition + 50
            const childBottom = childTop + child.clientHeight - 50

            const middle = (containerHeight - child.clientHeight + 200) / 2

            if (childTop <= middle && childBottom >= middle) {
                child.style.opacity = '1'
            } else if (childBottom < middle) {
                child.style.opacity = '0.1'
            } else {
                child.style.opacity = '0.3'
            }
        })
    }

    useEffect(() => {
        const container = postListRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            setTimeout(() => {
                handleScroll()
            }, 300)
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll)
            }
        }
    }, [])

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
            navigate('/login')
        } else {
            return
        }
    }

    // status: 1 no, 2 yes
    useEffect(() => {
        if (hashUserId && status === '1') {
            setMethod('signup')
        } else if (hashUserId) {
            setMethod('login')
        } else {
            setMethod('')
        }
    }, [])

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <div className="flex flex-col h-full items-center">
            <div
                className={clsx(
                    `z-20 flex flex-col w-11/12`,
                    method !== '' ? 'mb-12' : 'h-full'
                )}
            >
                <div className="flex flex-col gap-12">
                    {(method === '' || !isSmallDevice) && (
                        <div className="pt-24 flex items-center flex-col justify-center">
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
                            <motion.h2
                                className="text-sm font-light tracking-wider text-center text-white mt-9"
                                variants={textVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
                                提供你 100% 匿名身份、安全發言的社群！
                            </motion.h2>
                        </div>
                    )}
                    {method !== '' && (
                        <div className="md:hidden flex flex-col text-white font-semibold text-2xl tracking-wider mt-24">
                            <p>歡迎回到</p>
                            <p>Unirep Social TW！</p>
                            {method === 'login' && <p>再一步即可完成登入</p>}
                            {method === 'signup' && (
                                <p>只要兩步驟即可完成註冊</p>
                            )}
                        </div>
                    )}

                    {method === 'signup' && (
                        <motion.div
                            className="flex justify-center"
                            variants={basicVarients}
                            initial="hidden"
                            animate="visible"
                        >
                            {<StepInfo hashUserId={hashUserId} />}
                        </motion.div>
                    )}
                </div>

                {method !== '' && (
                    <div
                        className="absolute top-7 bg-[#E8ECF4] p-3 md:px-4 md:py-2 rounded-lg cursor-pointer flex justify-center items-center text-black"
                        onClick={handleBack}
                    >
                        <IoChevronBack size={16} />
                        <span className="md:block hidden mx-2 text-sm font-bold">
                            回到註冊頁
                        </span>
                    </div>
                )}
            </div>
            <AuthForm
                accessToken={accessToken}
                hashUserId={hashUserId}
                method={method}
                signMsg={signMsg}
                onSignup={() => setMethod('signup')}
                onLogin={() => setMethod('login')}
            />
            {method === '' && (
                <motion.div
                    className="fixed inset-0 z-30 overflow-scroll flex justify-center items-center pt-[59rem]"
                    variants={postListVariants}
                    initial="start"
                    animate="end"
                    ref={postListRef}
                >
                    <PostList />
                </motion.div>
            )}
        </div>
    )
}

export default Login
