import { useCallback, useState } from 'react'

export function useReportDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const onOpen = useCallback(() => setIsOpen(true), [])
    const onClose = useCallback(() => setIsOpen(false), [])
    return {
        isOpen,
        onOpen,
        onClose,
    }
}
