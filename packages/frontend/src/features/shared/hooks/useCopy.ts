import { useEffect, useState } from 'react'
import { useCopyToClipboard } from 'react-use'

export function useCopy(autoClearTimer: number = 2000) {
    const [copiedText, copyToClipboard] = useCopyToClipboard()
    const [hasCopied, setHasCopied] = useState(false)

    const handleCopy = (text: string) => {
        copyToClipboard(text)
        setHasCopied(true)
    }

    useEffect(() => {
        if (!hasCopied || autoClearTimer === 0) return

        const timer = setTimeout(() => {
            setHasCopied(false)
        }, autoClearTimer)

        return () => clearTimeout(timer)
    }, [hasCopied, autoClearTimer])

    return { copiedText, hasCopied, copyToClipboard: handleCopy }
}
