import React, { useContext, useEffect, useState } from 'react';
import { BsTwitter } from 'react-icons/bs';
import LoginButton from './LoginButton';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../contexts/User';
import { ethers } from 'ethers';
import { SERVER } from '../../config';
import { keccak256 } from 'js-sha3';

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
        console.log(data.url);
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
        console.log(`Signing up with server using hashUserId: ${hashUserId}`);
        try{        
            setIsLoading(true);
            const signature = await toast.promise(
                userContext.serverSignMessage(hashUserId),
                {
                    loading: '伺服器簽名中...',
                    success: <b>簽名成功!</b>,
                    error: <b>簽名失敗!</b>,
                }
            )
            localStorage.setItem('signature', signature.signMsg);
            await userContext.load();

            await toast.promise(
                userContext.signup(),
                {
                    loading: '登錄中...',
                    success: <b>驗證成功!</b>,
                    error: <b>驗證失敗!</b>,
                }
            );
            setIsLoading(false);
        } catch (error) {
            if (error instanceof Error && error.message.includes('UserAlreadySignedUp')) {
                toast.error('用戶已經註冊過了');
            } else {
                toast.error('驗證失敗');

            }
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const hashUserId = code;
        if (hashUserId) {
            localStorage.setItem('hashUserId', hashUserId)
        }
    }, []);

    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center py-8">
                {/* 
                TODO change code to other verifiable data, if you use code as a indicator then a hacker can input whatever code to localhost and bypass
                */}
                {code ? (
                    <>
                        <button onClick={() => handleSignupMethodChoice('signUpWithWallet')}>Signup with Wallet</button>
                        <button onClick={() => handleSignupMethodChoice('signUpWithServer')}>Signup with Server</button>                
                    </>
                ) : (
                    <LoginButton
                        isLoading={isLoading}
                        icon={BsTwitter}
                        onClick={handleTwitterLogin}
                        text='Login'
                    />
                )}
            </div>
        </div>
    )
}

export default AuthForm
