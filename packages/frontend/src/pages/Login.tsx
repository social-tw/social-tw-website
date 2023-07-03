import React from 'react'
import { useEffect, useState } from 'react'
import { BsTwitter } from 'react-icons/bs'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import LoginButton from '../components/login/LoginButton'

const Login: React.FC = () => {
    const [url, setUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const navigate = useNavigate()

    // url is optional
    useEffect(() => {
        axios
            .get('/api/twitter/url')
            .then((res) => {
                setUrl(res.data.url)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [])

    const handleLogin = () => {
      setIsLoading(true);
      // Redirect the user to the Twitter login page
      if (url) {
        window.location.href = url;
      }
    };

    return (
        <div
            data-theme="dark"
            className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg-px-8"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
                    Log in with your Twitter account
                </h2>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-10 sm:px-0">
                    <LoginButton
                        icon={BsTwitter}
                        onClick={() => handleLogin()}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    )
}

export default Login
