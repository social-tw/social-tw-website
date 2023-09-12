import { useCallback } from 'react'

const useTwitterVerify = (
    SERVER: string,
    method: string
) => {
    const handleTwitterVerify = useCallback(async () => {
        if (method === 'login') {
            localStorage.setItem('showLogin', 'isShow')
        }
        const response = await fetch(`${SERVER}/api/login`, {
            method: 'GET',
        })

        const data = await response.json()
        window.location.href = data.url
    }, [SERVER, method])

    return handleTwitterVerify
}

export default useTwitterVerify
