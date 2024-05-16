import { useEffect, useState } from 'react'
import SignupLoadingTransition from '@/components/login/SignupPendingTransition'
import HomePostForm from './HomePostForm'
import HomePostList from './HomePostList'
import { useIsLogin } from '@/hooks/useIsLogin/useIsLogin'
import { useIsMutating } from '@tanstack/react-query'
import { MutationKeys } from '@/constants/queryKeys'

export default function Home() {
    const { isLoggedIn } = useIsLogin()

    const signingUpCount = useIsMutating({ mutationKey: [MutationKeys.Signup] })
    const isPending = signingUpCount > 0

    const [isShowSignupLoadingTransition, setIsShowSignupLoadingTransition] =
        useState(false)

    const isSignupLoading = isPending || isShowSignupLoadingTransition

    useEffect(() => {
        if (isLoggedIn) {
            setTimeout(() => {
                setIsShowSignupLoadingTransition(false)
            }, 1500)
        } else {
            setIsShowSignupLoadingTransition(true)
        }
    }, [isLoggedIn])

    return (
        <div>
            <section className="relative hidden py-6 border-b border-neutral-600 md:block">
                <HomePostForm disabled={isSignupLoading} />
                {isSignupLoading && <SignupLoadingTransition />}
            </section>
            <section className="py-6">
                <HomePostList />
            </section>
        </div>
    )
}
