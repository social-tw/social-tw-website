import { PATHS } from '@/constants/paths'
import { SIGNUP_METHODS } from '@/constants/signupMethods'
import { LocalStorageHelper } from '@/utils/LocalStorageHelper'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function TwitterCallback() {
    useHandleTwitterCallback()
    return null
}

function useHandleTwitterCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const hashUserId = searchParams.get('code')
    const accessToken = searchParams.get('token')
    const status = searchParams.get('status')
    const signMsg = searchParams.get('signMsg')
    const error = searchParams.get('error')

    useEffect(() => {
        function isError() {
            return !!error
        }
        function isValidStatus(status: string | null) {
            return status && ['1', '2', '3'].includes(status)
        }

        function isValidParams() {
            return isValidStatus(status) && hashUserId && accessToken && signMsg
        }

        function main() {
            if (isError()) {
                navigate(PATHS.WELCOME)
            } else if (isValidParams()) {
                LocalStorageHelper.setHashUserId(hashUserId!)
                LocalStorageHelper.setSignature(signMsg!)
                LocalStorageHelper.setAccessToken(accessToken!)
                status === '1' && navigate(PATHS.SIGN_UP_INTERNAL)
                status === '2' &&
                    navigate(
                        `${PATHS.LOGIN_INTERNAL}/${SIGNUP_METHODS.METAMASK}`,
                    )
                status === '3' &&
                    navigate(`${PATHS.LOGIN_INTERNAL}/${SIGNUP_METHODS.SERVER}`)
            } else {
                navigate(PATHS.WELCOME)
            }
        }
        main()
    }, [])
}