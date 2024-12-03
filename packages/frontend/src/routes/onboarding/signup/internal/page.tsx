import {
    AuthErrorDialog,
    AuthNoteDialog,
    BackToWelcomeButton,
    Greeting,
    LoginButton,
    StepInfo,
    useSignupWithServer,
    useSignupWithWallet,
} from '@/features/auth'
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper'
import { getVariantAutoScrollY } from '@/utils/helpers/motionVariants'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { GrFormClose } from 'react-icons/gr'

enum NoteStatus {
    Close = 'close',
    Metamask = 'metamask',
    Server = 'server',
}

export default function SignupInternalPage() {
    const [noteStatus, setNoteStatus] = useState<NoteStatus>(NoteStatus.Close)

    const {
        isPending: isWalletSignupPending,
        error: walletSignupError,
        signup: walletSignup,
    } = useSignupWithWallet()
    const {
        isPending: isServerSignupPending,
        error: serverSignupError,
        signup: serverSignup,
    } = useSignupWithServer()

    const isPending = isWalletSignupPending || isServerSignupPending
    const error = walletSignupError || serverSignupError

    const hashUserId = LocalStorageHelper.getGuaranteedHashUserId()
    const variantAutoScrollY = getVariantAutoScrollY()

    return (
        <div className="flex flex-col items-center h-full">
            <div className="z-20 flex flex-col w-11/12 mb-6">
                <div className="flex flex-col gap-12">
                    <Greeting />
                    <p className="hidden text-2xl font-semibold tracking-wider text-center text-white md:block">
                        再一步即可完成註冊
                    </p>
                    <motion.div
                        className="flex justify-center"
                        variants={variantAutoScrollY}
                        initial="hidden"
                        animate="visible"
                    >
                        {<StepInfo hashUserId={hashUserId} />}
                    </motion.div>
                    <p className="text-white tracking-wide text-[15px] text-center">
                        選擇「錢包註冊」 / 「直接註冊」即代表未來登入的方式
                        ，無法再做更改
                    </p>
                </div>
                <BackToWelcomeButton />
            </div>
            <div className="flex flex-col items-center justify-center w-11/12 gap-8 lg:w-full lg:flex-row">
                <div className="flex flex-col items-center justify-center w-full lg:basis-[22rem] gap-2">
                    <LoginButton
                        isLoading={isPending}
                        onClick={walletSignup}
                        title={'錢包註冊'}
                        subTitle={'使用 MetaMask 錢包進行註冊'}
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
                <div className="flex flex-col items-center justify-center w-full lg:basis-[22rem] gap-2">
                    <LoginButton
                        isLoading={isPending}
                        onClick={serverSignup}
                        title={'直接註冊'}
                        subTitle={
                            '沒有錢包嗎? 沒關係! 可以直接使用 Server 註冊'
                        }
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
            </div>
            <AuthNoteDialog
                icon={GrFormClose}
                noteStatus={noteStatus}
                onClose={() => setNoteStatus(NoteStatus.Close)}
            />
            <AuthErrorDialog isOpen={!!error} message={error?.message} />
        </div>
    )
}
