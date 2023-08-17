import { useCallback, useContext } from "react"
import { ethers } from 'ethers'
import { User } from "../contexts/User"

declare global {
    interface Window {
        ethereum: any
    }
}

const useSignupWithWallet = (
    hashUserId: string | null, 
    userContext: User,
    navigate: (path: string) => void
) => {
    const signUpWithWallet = useCallback(async () => {
        try {
            userContext.setisSignupLoading(true)
            navigate('/')
            if (!hashUserId) {
                throw new Error('Invalid user')
            }
            if (!window.ethereum) {
                throw new Error('請安裝MetaMask錢包')
            }
            console.log('waiting sign up...')
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            const account = accounts[0]

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [
                    ethers.utils.hexlify(
                        ethers.utils.toUtf8Bytes(hashUserId)
                    ),
                    account,
                ],
            })

            localStorage.setItem('signature', signature)
            await userContext.load()
            await userContext.signup()
            console.log('has signed up')
        }   catch (error) {
            console.error(error)
        }   finally {
            userContext.setisSignupLoading(true)
        }
    }, [hashUserId, navigate, useContext])

    return signUpWithWallet
}

export default useSignupWithWallet