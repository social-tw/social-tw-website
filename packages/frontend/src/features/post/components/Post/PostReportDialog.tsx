import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { Backdrop, Dialog } from '@/features/shared'
import {
    Dialog as HeadlessDialog,
    DialogPanel as HeadlessDialogPanel,
} from '@headlessui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useReportPost } from '../../hooks/useReportPost'
import {
    ReportFormCtn,
    ReportFormDesc,
    ReportFormIntro,
    ReportFormReasons,
    ReportFormStepGroup,
    ReportFormStepLabel,
    ReportFormSubmitBtn,
} from '../ReportForm'

interface PostReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

export interface PortReportFormData {
    reason: number
    desc: string
}

enum SubmitState {
    NotSubmitted = 'not-submitted',
    Submitting = 'submitting',
    Success = 'success',
    Failure = 'failure',
}

export function PostReportDialog({ isOpen, onClose }: PostReportDialogProps) {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        reset,
        formState: { errors },
    } = useForm<PortReportFormData>({
        defaultValues: {
            reason: -1,
            desc: '',
        },
    })

    const [submitState, setSubmitState] = useState<SubmitState>(
        SubmitState.NotSubmitted,
    )

    const { report } = useReportPost()
    const onSubmit = async (data: any) => {
        try {
            setSubmitState(SubmitState.Submitting)
            await report(data)
            setSubmitState(SubmitState.Success)
        } catch (e) {
            setSubmitState(SubmitState.Failure)
        }
    }

    const shouldShowOriginalForm = submitState === SubmitState.NotSubmitted
    const shouldShowSubmitting = submitState === SubmitState.Submitting
    const shouldShowFail = submitState === SubmitState.Failure
    const shouldShowSuccess = submitState === SubmitState.Success

    return (
        <>
            {shouldShowOriginalForm && (
                <Dialog isOpen={isOpen} onClose={onClose}>
                    <ReportFormCtn onSubmit={handleSubmit(onSubmit)}>
                        <ReportFormIntro />
                        <ReportFormStepGroup>
                            <ReportFormStepLabel
                                title="1. 檢舉原因"
                                isRequired
                            />
                            <ReportFormReasons
                                register={register}
                                errors={errors}
                                setValue={setValue}
                                getValues={getValues}
                                trigger={trigger}
                            />
                        </ReportFormStepGroup>
                        <ReportFormStepGroup>
                            <ReportFormStepLabel
                                title="2. 檢舉描述"
                                isRequired
                            />
                            <ReportFormDesc
                                register={register}
                                errors={errors}
                            />
                        </ReportFormStepGroup>
                        <ReportFormSubmitBtn />
                    </ReportFormCtn>
                </Dialog>
            )}
            {shouldShowSubmitting && (
                <Submitting isOpen={shouldShowSubmitting} />
            )}
            {shouldShowFail && (
                <SubmitFail
                    isOpen={shouldShowFail}
                    onClose={() => {
                        reset(getValues())
                        setSubmitState(SubmitState.NotSubmitted)
                    }}
                />
            )}
            {shouldShowSuccess && (
                <SubmitSuccess
                    isOpen={shouldShowSuccess}
                    onClose={() => {
                        setSubmitState(SubmitState.NotSubmitted)
                        reset()
                        onClose()
                    }}
                />
            )}
        </>
    )
}

function Submitting({ isOpen }: { isOpen: boolean }) {
    return (
        <HeadlessDialog
            className="relative z-40"
            open={isOpen}
            onClose={() => {}}
        >
            <Backdrop isOpen={isOpen} position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="relative block w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-white/90 shadow-base"
                        as="dialog"
                    >
                        <div>提交中...</div>
                    </HeadlessDialogPanel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    )
}

function SubmitFail({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    return (
        <HeadlessDialog
            className="relative z-40"
            open={isOpen}
            onClose={onClose}
        >
            <Backdrop isOpen={isOpen} position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="relative block w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-white/90 shadow-base"
                        as="dialog"
                    >
                        <button
                            aria-label="close"
                            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]"
                            type="submit"
                            onClick={onClose}
                        >
                            <CloseIcon />
                        </button>
                        <div>失敗</div>
                    </HeadlessDialogPanel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    )
}

function SubmitSuccess({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    return (
        <HeadlessDialog
            className="relative z-40"
            open={isOpen}
            onClose={onClose}
        >
            <Backdrop isOpen={isOpen} position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="relative block w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-white/90 shadow-base"
                        as="dialog"
                    >
                        <button
                            aria-label="close"
                            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]"
                            type="submit"
                            onClick={onClose}
                        >
                            <CloseIcon />
                        </button>
                        <div>成功！</div>
                    </HeadlessDialogPanel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    )
}
