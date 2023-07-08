import React, { useContext } from "react"
import { useEffect, useState } from "react"
import { IconType } from "react-icons"
import { ethers } from "ethers"
import { User, UserContext } from "../../contexts/User"
import { LoadingContext } from "../../contexts/Loading"
import { toast } from "react-hot-toast"

interface TwitterLoginButtonProps {
    icon: IconType
}

declare global {
    interface Window {
        ethereum: any
    }
}

const TwitterLoginButton: React.FC<TwitterLoginButtonProps> = ({
    icon: Icon,
}) => {
    // TODO: set up loading page when sign up
    const userContext = useContext(UserContext)
    // TODO: maybe can use useRef
    const [hashUserId, setHashUserId] = useState<string>('')
    const { isLoading, setIsLoading } = useContext(LoadingContext)
    const [isVerified, setIsVerified] = useState<boolean>(false)

    // TODO: use User.tx method
    const handleTwitterLogin = async () => {
        setIsLoading(true)
        // Make a backend call to get the request token from Twitter
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'GET',
        })

        const data = await response.json()
        setIsLoading(false)
        // Redirect the user to Twitter for authorization
        window.location.href = data.url
    }

    // once redirect back, the hashUserId will carry in the param of url 
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const hashUserId = urlParams.get('code')

        if (hashUserId && !isVerified) {
            setHashUserId(hashUserId)
            localStorage.setItem('hashUserId', hashUserId)

            // Check if MetaMask is installed
            if (!window.ethereum) {
                console.error('Please install MetaMask')
                toast.error("請下載MetaMask錢包")
                return
            }
            // Request account access
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then((accounts: string[]) => {
                    setIsLoading(true)
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
                        .then(async (signature: string) => {
                            // TODO: not sure store in localstorage is proper
                            localStorage.setItem('signature', signature)
                            await userContext.load()
                        })
                        .then(async () => {
                            await toast.promise(
                                userContext.signup(),
                                {
                                  loading: '登錄中...', 
                                  success: <b>錢包驗證成功!</b>, 
                                  error: <b>錢包驗證失敗!</b>, 
                                }
                              )
                            setIsLoading(false)
                        })
                        .catch((error: any) => {
                            console.error('Error signing message:', error)
                            toast.error("錢包驗證失敗")
                            setIsLoading(false)
                        })
                })
                .catch((error: any) => {
                    console.error('Error requesting account access:', error)
                    toast.error("錢包連線失敗")
                    setIsLoading(false)
                })
            setIsVerified(true)        
        }
    }, [hashUserId])

    return (
        <button
            type="button"
            onClick={() => handleTwitterLogin()}
            disabled={isLoading}
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