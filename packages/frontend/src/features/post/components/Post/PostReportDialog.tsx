import ReportContent from '@/features/reporting/components/Adjudicate/ReportContent'

import { useState } from 'react'
import { FieldValues, useForm, UseFormGetValues } from 'react-hook-form'
import { useReportPost } from '../../hooks/useReportPost/useReportPost'
import {
    InfoDialog,
    REGISTER_ID_DESC,
    REGISTER_ID_REASON,
    ReportFormCategories,
    ReportFormCtn,
    ReportFormIntro,
    ReportFormReason,
    ReportFormStepGroup,
    ReportFormStepLabel,
    ReportFormSubmitBtn,
    ReportFormSubmitFailure,
    ReportFormSubmitSuccess,
    ReportFormSubmitting,
} from '../ReportForm'
import Dialog from '@/features/shared/components/Dialog/Dialog'

interface PostReportDialogProps {
    postId: string
    content: string
    isOpen: boolean
    onClose: () => void
}

const defaultValues = {
    [`${REGISTER_ID_REASON}`]: -1,
    [`${REGISTER_ID_DESC}`]: '',
}

export function PostReportDialog({
    postId,
    content,
    isOpen,
    onClose,
}: PostReportDialogProps) {
    const [step, setStep] = useState<number>(1)

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        reset: resetForm,
        formState: { errors },
    } = useForm<FieldValues>({ defaultValues })

    const {
        isIdle,
        isPending,
        isError,
        isSuccess,
        reportPost,
        reset: resetState,
    } = useReportPost()

    const onSubmit = handleSubmit(async (data) => {
        try {
            await reportPost({
                postId,
                category: data[`${REGISTER_ID_REASON}`],
                reason: data[`${REGISTER_ID_DESC}`],
            })
        } catch (error) {}
    })

    const resetStep = () => {
        setStep(1)
    }

    const onFailureResubmit = useFailureResubmitDialogFlow({
        resetForm,
        resetState,
        getValues,
    })

    const onCloseDialog = useCloseDialogFlow({
        resetForm,
        resetState,
        onClose,
        resetStep,
    })

    return (
        <>
            {step === 1 && (
                <InfoDialog
                    isOpen={isOpen}
                    onClose={onCloseDialog}
                    onButtonClick={() => setStep(2)}
                />
            )}

            {step === 2 && isIdle && (
                <Dialog isOpen={isOpen} onClose={onCloseDialog}>
                    <ReportFormCtn onSubmit={onSubmit}>
                        <ReportFormIntro />
                        <ReportContent content={content} />
                        <ReportFormStepGroup>
                            <ReportFormStepLabel
                                title="1. 檢舉原因"
                                isRequired
                            />
                            <ReportFormCategories
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
                            <ReportFormReason
                                register={register}
                                errors={errors}
                            />
                        </ReportFormStepGroup>
                        <ReportFormSubmitBtn />
                    </ReportFormCtn>
                </Dialog>
            )}

            {isPending && <ReportFormSubmitting />}
            {isError && (
                <ReportFormSubmitFailure
                    onClose={onCloseDialog}
                    onResubmit={onFailureResubmit}
                />
            )}
            {isSuccess && <ReportFormSubmitSuccess onClose={onCloseDialog} />}
        </>
    )
}

function useCloseDialogFlow({
    resetForm,
    resetState,
    onClose,
    resetStep,
}: {
    resetForm: () => void
    resetState: () => void
    onClose: () => void
    resetStep: () => void
}) {
    return () => {
        resetForm()
        resetState()
        onClose()
        resetStep()
    }
}

function useFailureResubmitDialogFlow({
    resetForm,
    resetState,
    getValues,
}: {
    resetForm: (values: FieldValues) => void
    resetState: () => void
    getValues: UseFormGetValues<FieldValues>
}) {
    return () => {
        resetForm(getValues())
        resetState()
    }
}
