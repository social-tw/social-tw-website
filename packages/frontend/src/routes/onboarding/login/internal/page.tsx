import { SIGNUP_METHODS } from '@/constants/signupMethods'
import {
    AuthErrorDialog,
    AuthNoteDialog,
    BackToWelcomeButton,
    Greeting,
    LoginButton,
    useLoginWithServer,
    useLoginWithWallet,
} from '@/features/auth'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

enum NoteStatus {
    Close = 'close',
    Metamask = 'metamask',
    Server = 'server',
}

export default function LoginInternalPage() {
    const { selectedSignupMethod } = useParams()
    const navigate = useNavigate()

    const handleClose = () => {
        navigate('/welcome')
    }

    const {
        isPending: isWalletLoginPending,
        error: walletLoginError,
        login: walletLogin,
    } = useLoginWithWallet()
    const {
        isPending: isServerLoginPending,
        error: serverLoginError,
        login: serverLogin,
    } = useLoginWithServer()

    const isPending = isWalletLoginPending || isServerLoginPending
    const error = walletLoginError || serverLoginError

    const [noteStatus, setNoteStatus] = useState<NoteStatus>(NoteStatus.Close)

    return (
        <div className="flex flex-col items-center h-full">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <div className="lg:space-y-12">
                    <Greeting />
                    <p className="text-2xl font-semibold tracking-wider text-left text-white lg:text-center md:block">
                        再一步即可完成登入
                    </p>
                </div>
                <BackToWelcomeButton />
            </div>
            {selectedSignupMethod === SIGNUP_METHODS.METAMASK && (
                <div className="w-11/12 md:w-full flex flex-col justify-center items-center gap-2 max-w-[500px]">
                    <p className="text-white tracking-wide text-[15px] mb-5 px-2">
                        您當時註冊時選擇為「錢包註冊」，因此這步驟請使用此方式登入。若需要更改登入方式，請返回上一頁使用其他
                        Twitter 帳號註冊
                    </p>
                    <LoginButton
                        isLoading={isPending}
                        onClick={walletLogin}
                        title={'錢包登入'}
                        subTitle={'使用 MetaMask 錢包進行登入'}
                        color="#2F9CAF"
                        text="2xl"
                    />
                    <p
                        className="text-sm text-[#868D8F] cursor-pointer hover:underline"
                        onClick={() => setNoteStatus(NoteStatus.Metamask)}
                    >
                        什麼是
                        <span className="text-[#52ACBC]"> MetaMask 錢包 </span>?
                    </p>
                </div>
            )}
            {selectedSignupMethod === SIGNUP_METHODS.SERVER && (
                <div className="w-11/12 md:w-full flex flex-col justify-center items-center gap-2 max-w-[500px]">
                    <p className="text-white tracking-wide text-[15px] mb-5 px-2">
                        您當時註冊時選擇為「直接註冊」，因此這步驟請使用此方式登入。若需要更改登入方式，請返回上一頁使用其他
                        Twitter 帳號註冊
                    </p>
                    <LoginButton
                        isLoading={isPending}
                        onClick={serverLogin}
                        title={'直接登入'}
                        subTitle={'使用 Server 登入'}
                        color="#DB7622"
                        text="2xl"
                    />
                    <p
                        className="text-sm text-[#868D8F] cursor-pointer hover:underline"
                        onClick={() => setNoteStatus(NoteStatus.Server)}
                    >
                        什麼是
                        <span className="text-[#52ACBC]"> Server 註冊 </span>?
                    </p>
                </div>
            )}
            <AuthNoteDialog
                noteStatus={noteStatus}
                onClose={() => setNoteStatus(NoteStatus.Close)}
            />
            <AuthErrorDialog
                isOpen={!!error}
                message={error?.message}
                onClose={handleClose}
            />
        </div>
    )
}
