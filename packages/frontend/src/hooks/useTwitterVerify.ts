import { useCallback } from "react"

const useTwitterVerify = (SERVER: string) => {
    const handleTwitterVerify = useCallback(async () => {
        const response = await fetch(`${SERVER}/api/login`, {
            method: 'GET',
        })

        const data = await response.json()
        window.location.href = data.url
    }, [SERVER])

    return handleTwitterVerify
}

export default useTwitterVerify