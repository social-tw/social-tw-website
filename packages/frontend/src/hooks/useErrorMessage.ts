import { useMemo } from 'react'
import ERROR_MESSAGES from '../constants/error-messages/errorMessage'

export default function useErrorMessage(
    errorCode: keyof typeof ERROR_MESSAGES | '',
) {
    return useMemo(() => {
        if (!errorCode) return { code: 'NO_ERROR', message: '' }
        return ERROR_MESSAGES[errorCode]
    }, [errorCode])
}
