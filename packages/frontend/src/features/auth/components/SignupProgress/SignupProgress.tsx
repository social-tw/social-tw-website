import { useAuthStatus } from '../../hooks/useAuthStatus/useAuthStatus'
import { useSignupProgressStore } from './signupProgressStore'

export default function SignupProgress() {
    const { value, max } = useSignupProgressStore()

    const { isSignedUp, isSigningUp } = useAuthStatus()

    const message = isSignedUp
        ? '恭喜註冊成功！ 🙌🏻'
        : isSigningUp
        ? '努力註冊中，先來認識平台的功能吧！'
        : ''

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <progress
                className="h-3 max-w-72 progress progress-gradient"
                value={value}
                max={max}
            />
            <p className="text-sm tracking-wide text-content">{message}</p>
        </div>
    )
}
