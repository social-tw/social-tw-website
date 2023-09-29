import { useMemo } from 'react'
import ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useErrorMessage = (errorCode: keyof typeof ERROR_MESSAGES | '') => {
    const errorMessage = useMemo(() => {
        if (!errorCode) return { code: 'NO_ERROR', message: '' }
        return ERROR_MESSAGES[errorCode]
    }, [errorCode])

    return errorMessage
}

export default useErrorMessage
