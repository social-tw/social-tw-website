import React, { useContext, useEffect, useState } from 'react';
import { BsTwitter } from 'react-icons/bs';
import LoginButton from './LoginButton';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../contexts/User';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { SERVER } from '../../config';

declare global {
    interface Window {
        ethereum: any
    }
}

// TODO: Twitter auto login: when user has login twitter but haven't signed up
// TODO: redirect bug: when user have to loggin with twitter it redirect to twitter
// TODO: twitter login form is ugly
const AuthForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isTwitterVerified, setIsTwitterVerified] = useState(false);
    const code = searchParams.get('code');
    const userContext = useContext(UserContext);
    const [signupMethod, setSignupMethod] = useState<string | null>(null);

    const handleTwitterLogin = async () => {
        setIsLoading(true);
        const response = await fetch(`${SERVER}/api/login`, {
            method: 'GET',
        });

        const data = await response.json();
        setIsLoading(false);
        window.location.href = data.url;
        setIsTwitterVerified(true);
    }

    const handleSignupMethodChoice = async (method: string) => {
        setSignupMethod(method);
        const hashUserId = localStorage.getItem('hashUserId');
        if (!hashUserId) {
            console.error("hashUserId not found in local storage");
            return;
        }
        if (method === 'signUpWithWallet') {
            signUpWithWallet(hashUserId);
        } else if (method === 'signUpWithServer') {
            signUpWithServer(hashUserId);
        }
    }

    const signUpWithWallet = async (hashUserId: string) => {
        if (!window.ethereum) {
            toast.error('請下載MetaMask錢包');
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setIsLoading(true);
            const account = accounts[0];

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [
                    ethers.utils.hexlify(
                        ethers.utils.toUtf8Bytes(hashUserId)
                    ),
                    account,
                ],
            });

            localStorage.setItem('signature', signature);
            await userContext.load();

            await toast.promise(
                userContext.signup(),
                {
                    loading: '登錄中...',
                    success: <b>錢包驗證成功!</b>,
                    error: <b>錢包驗證失敗!</b>,
                }
            );
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('錢包驗證失敗');
            setIsLoading(false);
        }
    };

    const signUpWithServer = async (hashUserId: string) => {
        // TODO: implement this
        console.log(`Signing up with server using hashUserId: ${hashUserId}`);
    }

    useEffect(() => {
        const hashUserId = code;
        if (hashUserId) {
            localStorage.setItem('hashUserId', hashUserId)
            signUpWithWallet(hashUserId);
        }
    }, []);

    const authVarients = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 2,
                duration: 1,
                ease: "easeInOut",
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
            <LoginButton
                isLoading={isLoading}
                icon={BsTwitter}
                onClick={handleTwitterLogin}
                title='立即登入'
                subTitle='歡迎回來提供你的獨到見解！'
                color='#2F9CAF'
            />
            <LoginButton
                isLoading={isLoading}
                icon={BsTwitter}
                onClick={handleTwitterLogin}
                title='立即註冊'
                subTitle='加入我們的匿名討論行列！'
                color='#DB7622'
            />
        </motion.div>
    )
}

export default AuthForm
