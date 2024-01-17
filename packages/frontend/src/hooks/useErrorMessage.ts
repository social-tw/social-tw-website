import ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useErrorMessage = (errorCode: keyof typeof ERROR_MESSAGES | '') => {
    if (!errorCode) {
        return { code: 'NO_ERROR', message: '' }
    }

    const errorMessage = ERROR_MESSAGES[errorCode]
    if (!errorMessage) {
        return {
            code: 'UNKNOWN_ERROR_CODE',
            message: `The error code is unknown: ${errorCode}`,
        }
    }

    return errorMessage
}

export default useErrorMessage
