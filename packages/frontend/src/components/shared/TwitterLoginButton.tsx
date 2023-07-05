import React from 'react'
import { useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import { useNavigate } from 'react-router-dom'
import User from '../../contexts/User'
import { ethers } from 'ethers'

// At the top of your TypeScript file
declare global {
    interface Window {
        ethereum: any
    }
}

interface TwitterLoginButtonProps {
    icon: IconType
}

const TwitterLoginButton: React.FC<TwitterLoginButtonProps> = ({
    icon: Icon,
}) => {
    const userContext = React.useContext(User)
    const navigate = useNavigate()
    const [hashUserId, setHashUserId] = useState('')

    const handleTwitterLogin = async () => {
        // Make a backend call to get the request token from Twitter
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'GET',
        })

        const data = await response.json()

        // Redirect the user to Twitter for authorization
        window.location.href = data.url
    }

    // once redirect back, the hashUserId will carry in the param of url
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const hashUserId = urlParams.get('code')

        if (hashUserId) {
            setHashUserId(hashUserId)
            // TODO not sure store in localstorage is proper
            localStorage.setItem('hashUserId', hashUserId)
            // todo generate the identity

            // Check if MetaMask is installed
            if (!window.ethereum) {
                console.error('Please install MetaMask')
                return
            }
            // Request account access
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then((accounts: string[]) => {
                    const account = accounts[0]

                    // Sign the message
                    window.ethereum
                        .request({
                            method: 'personal_sign',
                            params: [
                                ethers.utils.hexlify(
                                    ethers.utils.toUtf8Bytes(hashUserId)
                                ),
                                account,
                            ],
                        })
                        .then((signature: string) => {
                            console.log(`Signature: ${signature}`)
                            // TODO not sure store in localstorage is proper
                            localStorage.setItem('signature', signature)
                            userContext.load()
                        })
                        .catch((error: any) => {
                            console.error('Error signing message:', error)
                        })
                })
                .catch((error: any) => {
                    console.error('Error requesting account access:', error)
                })
        }
    }, [])

    return (
        <button
            type="button"
            onClick={() => handleTwitterLogin()}
            className="
        inline-flex
        w-full
        justify-center
        items-center
        gap-4
        rounded-md
        bg-blue-400
        px-4
        py-2
        text-white
        hover:bg-gray-500
        focus:outline-offset-0
      "
        >
            <Icon />
            <span>Login</span>
        </button>
    )
}

export default TwitterLoginButton
