import React, { useContext, useEffect, useState } from 'react';
import AuthForm from '../components/login/AuthForm';
import { motion } from 'framer-motion';
import DemoPostList from '../components/login/DemoPostList';

// TODO: Change font family
const Login: React.FC = () => {

    const logoVariants = {
        start: { opacity: 0 },
        end: {
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
                delay: 0.5,
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
                delay: 1,
                duration: 1,
                ease: 'easeInOut',
            },
        },
    }

    // TODO: display success interface to user
    return (
        <div className='flex flex-col h-full'>
            <div className='z-40 h-full flex flex-col justify-between'>
                <div
                    className='pt-24 flex items-center flex-col justify-center'
                >
                    <motion.img
                        src={require('../../public/unirep_logo_white.png')}
                        alt='UniRep Logo'
                        className='w-[120px] mb-2'
                        variants={logoVariants}
                        initial='start'
                        animate='end'
                    />
                    <motion.h1
                        className="text-2xl font-semibold text-neutral-200"
                        variants={textVariants}
                        initial='hidden'
                        animate='visible'
                    >
                        Unirep Social TW
                    </motion.h1>
                    <motion.h2
                        className="mb-6 text-sm font-light tracking-wider text-center text-white mt-9"
                        variants={textVariants}
                        initial='hidden'
                        animate='visible'
                    >
                        嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
                        提供你 100% 匿名身份、安全發言的社群！
                    </motion.h2>
                </div>
                <AuthForm />
            </div>
            <motion.div 
                className='fixed inset-0 z-30 overflow-y-none mt-[220px]'
                variants={postListVariants}
                initial='start'
                animate='end'
            >
                <DemoPostList />
            </motion.div>
        </div>
    )
}

export default Login
