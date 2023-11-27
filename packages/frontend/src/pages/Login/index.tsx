import { useMediaQuery } from '@uidotdev/usehooks'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { BackToWelcomePageButton } from '../../components/Button/BackToWelcomeButton'
import { TwitterLoginButton } from '../../components/Button/TwitterButton'
import { GreetingContent } from '../../components/Greeting/GreetingContent'
import { GreetingContentOnSmallDevice } from '../../components/Greeting/GreetingContentOnSmallDevice'
import { GreetingLogo } from '../../components/Greeting/GreetingLogo'
import { GreetingTitle } from '../../components/Greeting/GreetingTitle'
import { PATHS } from '../../constants/paths'
import { SIGNUP_METHODS } from '../../constants/signupMethods'
import { LocalStorageHelper } from '../../utils/LocalStorageHelper'
import { getVariantAutoScrollY } from '../../utils/motionVariants'

export function Login() {
    // TODO: move handle callback to "twitter/callback" page
    useHandleTwitterCallback()
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
    const variantAutoScrollY = getVariantAutoScrollY()
    return (
        <div className="flex flex-col h-full items-center">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <div className="flex flex-col gap-12">
                    {!isSmallDevice && (
                        <div className="flex items-center flex-col justify-center pt-24">
                            <GreetingLogo />
                            <GreetingTitle />
                            <GreetingContent />
                        </div>
                    )}
                    {isSmallDevice && <GreetingContentOnSmallDevice />}
                </div>
                <BackToWelcomePageButton />
            </div>
            <motion.div
                className="md:pb-28 pb-8 min-w-[19rem] w-11/12 flex flex-col justify-center items-center gap-6 z-40"
                variants={variantAutoScrollY}
                initial="hidden"
                animate="visible"
            >
                <TwitterLoginButton />
            </motion.div>
        </div>
    )
}

// TODO: it's good idea to create a page like "twitter/callback" to handle callback instead of using "login" page
// TODO: with "twitter/callback" we can (a) prevent flashing on ui (b) detect invalid and redirect to welcome page
function useHandleTwitterCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const hashUserId = searchParams.get('code')
    const accessToken = searchParams.get('token')
    const status = searchParams.get('status')
    const signMsg = searchParams.get('signMsg')

    useEffect(() => {
        function isValidStatus(status: string | null) {
            return status && ['1', '2', '3'].includes(status)
        }
        function isValidParams() {
            return isValidStatus(status) && hashUserId && accessToken && signMsg
        }
        function main() {
            if (isValidParams()) {
                LocalStorageHelper.setHashUserId(hashUserId!)
                LocalStorageHelper.setSignature(signMsg!)
                LocalStorageHelper.setAccessToken(accessToken!)
                status === '1' && navigate(PATHS.SIGN_UP_INTERNAL)
                status === '2' &&
                    navigate(
                        `${PATHS.LOGIN_INTERNAL}/${SIGNUP_METHODS.METAMASK}`
                    )
                status === '3' &&
                    navigate(`${PATHS.LOGIN_INTERNAL}/${SIGNUP_METHODS.SERVER}`)
            } else {
                // TODO: once we have "twitter/callback" page, we can navigate to "welcome" if param is invalid
                navigate(PATHS.LOGIN)
            }
        }
        main()
    }, [])
}
