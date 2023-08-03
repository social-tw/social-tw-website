import React, { useContext, useEffect } from 'react';
import AuthForm from '../components/login/AuthForm';
import { motion } from 'framer-motion';
import DemoPostList from '../components/shared/DemoPostList';

// TODO: Change font family
const Login: React.FC = () => {

    const logoVariants = {
        start: { scale: 1.4, opacity: 0 },
        end: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeInOut",
            },
        },
    };

    const textVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.5,
                duration: 0.5,
                ease: "easeInOut",
            },
        },
    };

    const postListVariants = {
        start: { y: 700 },
        end: {
            y: 0,
            transition: {
                delay: 1,
                duration: 1,
                ease: "easeInOut",
            },
        }
    }

    return (
        <>
            <div className='z-50 h-full flex flex-col justify-between md:justify-center md:flex-row'>
                <div
                    className='md:mt-0 mt-[100px] flex items-center flex-col justify-center'
                >
                    <motion.img
                        src={require('../../public/unirep_logo_white.png')}
                        alt="UniRep Logo"
                        className='max-w-[160px]'
                        variants={logoVariants}
                        initial="start"
                        animate="end"
                    />
                    <motion.h1
                        className='text-2xl text-neutral-200 font-semibold'
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Unirep Social TW
                    </motion.h1>
                    <motion.h2
                        className='mb-6 mt-9 text-sm font-light text-white text-center tracking-wider'
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        嗨 🙌🏻 歡迎來到 Unirep Social TW <br />提供你 100% 匿名身份、安全發言的社群！
                    </motion.h2>
                </div>
                <AuthForm />
            </div>
            <motion.div 
                className='md:hidden fixed inset-0 z-10 overflow-y-none mt-[220px]'
                variants={postListVariants}
                initial="start"
                animate="end"
            >
                <DemoPostList />
            </motion.div>
        </>
    )
}

export default Login
