import { useMemo } from 'react'
import LOGIN_ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useErrorMessage = (errorCode: keyof typeof LOGIN_ERROR_MESSAGES | '') => {
    const errorMessage = useMemo(() => {
        if (!errorCode) return { code: 'NO_ERROR', message: '' }
        return LOGIN_ERROR_MESSAGES[errorCode]
    }, [errorCode])

    return errorMessage
}

export default useErrorMessage
