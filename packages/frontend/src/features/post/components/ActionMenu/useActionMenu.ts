import { ReactEventHandler, useCallback, useState } from 'react'

export function useActionMenu() {
    const [isOpen, setIsOpen] = useState(false)

    const onOpen: ReactEventHandler = useCallback((e) => {
        e.preventDefault()
        setIsOpen(true)
    }, [])

    const onClose = useCallback(() => setIsOpen(false), [])

    return {
        isOpen,
        onOpen,
        onClose,
    }
}
