import { useState } from 'react'
import { GrFormClose } from 'react-icons/gr'
import { useParams } from 'react-router-dom'
import { useMediaQuery } from '@uidotdev/usehooks'
import { BackToWelcomePageButton } from '../../components/Button/BackToWelcomeButton'
import { GreetingContent } from '../../components/Greeting/GreetingContent'
import { GreetingLogo } from '../../components/Greeting/GreetingLogo'
import { GreetingTitle } from '../../components/Greeting/GreetingTitle'
import AuthErrorDialog from '../../components/login/AuthErrorDialog'
import AuthNoteDialog from '../../components/login/AuthNoteDialog'
import LoginButton from '../../components/login/LoginButton'
import { SIGNUP_METHODS } from '../../constants/signupMethods'
import { useUser } from '../../contexts/User'
import { useLoginWithServer } from '../../hooks/useLoginWithServer'
import { useLoginWithWallet } from '../../hooks/useLoginWithWallet'

enum NoteStatus {
    Close = 'close',
    Metamask = 'metamask',
    Server = 'server',
}

export function InternalLogin() {
    const [noteStatus, setNoteStatus] = useState<NoteStatus>(NoteStatus.Close)
    const { selectedSignupMethod } = useParams()
    const { signupStatus, errorCode } = useUser()
    const loginWithServer = useLoginWithServer()
    const loginWithWallet = useLoginWithWallet()
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <div className="flex flex-col items-center h-full">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <div className="flex flex-col gap-12">
                    {!isSmallDevice && (
                        <div className="flex flex-col items-center justify-center pt-24">
                            <div className="flex flex-col items-center justify-center pt-24">
                                <GreetingLogo />
                                <GreetingTitle />
                                <GreetingContent />
                            </div>
                        </div>
                    )}
                    <p className="hidden text-2xl font-semibold tracking-wider text-center text-white md:block">
                        再一步即可完成登入
                    </p>
                </div>
                <BackToWelcomePageButton />
            </div>
            {selectedSignupMethod === SIGNUP_METHODS.METAMASK && (
                <div className="w-full flex flex-col justify-center items-center gap-2 max-w-[500px]">
                    <p className="text-white tracking-wide text-[15px] mb-5 px-2">
                        您當時註冊時選擇為「錢包註冊」，因此這步驟請使用此方式登入。若需要更改登入方式，請返回上一頁使用其他
                        Twitter 帳號註冊
                    </p>
                    <LoginButton
                        isLoading={signupStatus === 'pending'}
                        onClick={loginWithWallet}
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
                <div className="w-full flex flex-col justify-center items-center gap-2 max-w-[500px]">
                    <p className="text-white tracking-wide text-[15px] mb-5 px-2">
                        您當時註冊時選擇為「直接註冊」，因此這步驟請使用此方式登入。若需要更改登入方式，請返回上一頁使用其他
                        Twitter 帳號註冊
                    </p>
                    <LoginButton
                        isLoading={signupStatus === 'pending'}
                        onClick={loginWithServer}
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
                icon={GrFormClose}
                noteStatus={noteStatus}
                onClose={() => setNoteStatus(NoteStatus.Close)}
            />
            <AuthErrorDialog isOpen={errorCode !== ''} />
        </div>
    )
}
