import { useCallback, useContext } from 'react'
import { ethers } from 'ethers'

declare global {
    interface Window {
        ethereum: any
    }
}

const useSignupWithWallet = (
    hashUserId: string | null,
    userContext: any,
    setIsLoading: any
) => {
    const signUpWithWallet = useCallback(async () => {
        try {
            setIsLoading(true)
            if (!hashUserId) {
                throw new Error('Invalid user')
            }
            if (!window.ethereum) {
                throw new Error('請安裝MetaMask錢包')
            }
            console.log('waiting sign up...')
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            })
            const account = accounts[0]

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [
                    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(hashUserId)),
                    account,
                ],
            })

            localStorage.setItem('signature', signature)

            await userContext.load()

            await userContext.signup()
        } catch (error) {
            console.error(error)
        } finally {
            console.log('has signed up') // TODO is it acceptiable?
            setIsLoading(false)
        }
    }, [hashUserId, setIsLoading, useContext])

    return signUpWithWallet
}

export default useSignupWithWallet
