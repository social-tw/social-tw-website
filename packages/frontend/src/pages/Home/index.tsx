import { useEffect, useMemo, useState } from 'react'
import SignupLoadingTransition from '@/components/login/SignupPendingTransition'
import { useUser } from '@/contexts/User'
import HomePostForm from './HomePostForm'
import HomePostList from './HomePostList'

export default function Home() {
    const { isLogin, signupStatus } = useUser()

    const [isShowSignupLoadingTransition, setIsShowSignupLoadingTransition] =
        useState(false)

    const isSignupLoading = useMemo(
        () => signupStatus !== 'default' && isShowSignupLoadingTransition,
        [signupStatus, isShowSignupLoadingTransition],
    )

    useEffect(() => {
        if (isLogin) {
            setTimeout(() => {
                setIsShowSignupLoadingTransition(false)
            }, 1500)
        } else {
            setIsShowSignupLoadingTransition(true)
        }
    }, [isLogin])

    return (
        <div className="px-4">
            <section className="relative hidden py-6 border-b border-neutral-600 md:block">
                <HomePostForm disabled={isSignupLoading} />
                {isSignupLoading && (
                    <SignupLoadingTransition
                        status={signupStatus}
                        isOpen={true}
                        opacity={0}
                    />
                )}
            </section>
            <section className="py-6">
                <HomePostList />
            </section>
        </div>
    )
}
