import React, { useContext, useEffect, useState } from 'react';
import { BsTwitter } from 'react-icons/bs';
import LoginButton from './LoginButton';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../contexts/User';
import { ethers } from 'ethers';
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
    const [isVerified, setIsVerified] = useState(false);
    const code = searchParams.get('code');
    const userContext = useContext(UserContext);

    const handleTwitterLogin = async () => {
        setIsLoading(true);
        const response = await fetch(`${SERVER}/api/login`, {
            method: 'GET',
        });

        const data = await response.json();
        setIsLoading(false);
        window.location.href = data.url;
    }

    const signUp = async (hashUserId: string) => {
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

    useEffect(() => {
        const hashUserId = code;
        if (hashUserId && !isVerified) {
            localStorage.setItem('hashUserId', hashUserId)
            signUp(hashUserId);
        }
        setIsVerified(true);
    }, []);

    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center py-8">
                <LoginButton
                    isLoading={isLoading}
                    icon={BsTwitter}
                    onClick={handleTwitterLogin}
                    text='Login'
                />
            </div>
        </div>
    )
}

export default AuthForm
