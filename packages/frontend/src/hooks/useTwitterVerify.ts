import { useCallback } from 'react'

const useTwitterVerify = (setIsLoading: any, SERVER: string) => {
    const handleTwitterVerify = useCallback(async () => {
        setIsLoading(true)
        const response = await fetch(`${SERVER}/api/login`, {
            method: 'GET',
        })

        const data = await response.json()
        window.location.href = data.url
    }, [setIsLoading, SERVER])

    return handleTwitterVerify
}

export default useTwitterVerify
