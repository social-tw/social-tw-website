import { useState } from 'react'

export function useCopyPostLink(postId?: string) {
    const [isCopied, setIsCopied] = useState(false)

    const handleShareClick = async () => {
        if (!postId) return
        const postLink = `${window.location.origin}/post/${postId}`

        try {
            await navigator.clipboard.writeText(postLink)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (error) {
            setIsCopied(false)
        }
    }

    return {
        isCopied,
        handleShareClick,
    }
}
