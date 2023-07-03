import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import TwitterLoginButton from '../shared/TwitterLoginButton'

const AuthForm = () => {
    const [url, setUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const navigate = useNavigate()

    // // url is optional
    // useEffect(() => {
    //     axios
    //         .get('/api/twitter/url')
    //         .then((res) => {
    //             setUrl(res.data.url)
    //         })
    //         .catch((err) => {
    //             console.error(err)
    //         })
    // }, [])

    // const handleLogin = () => {
    //     setIsLoading(true)
    //     // Redirect the user to the Twitter login page
    // }
    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <TwitterLoginButton 
                  theme={`dark`}
                />
            </div>
        </div>
    )
}

export default AuthForm
