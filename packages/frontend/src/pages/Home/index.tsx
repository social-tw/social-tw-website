import { useEffect, useState } from 'react'
import SignupLoadingTransition from '@/components/login/SignupPendingTransition'
import { useUser } from '@/contexts/User'
import HomePostForm from './HomePostForm'
import HomePostList from './HomePostList'

export default function Home() {
    const { isLogin, signupStatus } = useUser()
    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        if (isLogin) {
            setTimeout(() => {
                setIsShow(false)
            }, 1500)
        } else {
            setIsShow(true)
        }
    }, [isLogin])

    return (
        <div className="px-4">
            <section className="relative hidden py-6 border-b border-neutral-600 md:block">
                <HomePostForm
                    disabled={signupStatus === 'default' ? false : isShow}
                />
                {signupStatus !== 'default' && isShow && (
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
