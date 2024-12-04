import ReportContent from '@/features/reporting/components/Adjudicate/ReportContent'
import { useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
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
    ReportFormSubmitting,
} from '../ReportForm'
import Dialog from '@/features/shared/components/Dialog/Dialog'
import { usePostById } from '@/features/post/hooks/usePostById/usePostById'

interface PostReportDialogProps {
    postId: string
    isOpen: boolean
    onClose: () => void
}

const defaultValues = {
    [`${REGISTER_ID_REASON}`]: -1,
    [`${REGISTER_ID_DESC}`]: '',
}

export function PostReportDialog({
    postId,
    isOpen,
    onClose,
}: PostReportDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const onCloseTransition = () => {
        setIsSubmitting(false)
    }

    const onCloseDialog = useCloseDialogFlow({
        resetForm,
        resetState,
        onClose,
        onCloseTransition,
        resetStep,
    })

    useEffect(() => {
        if (isPending) {
            onClose()
            setIsSubmitting(true)
            const timer = setTimeout(() => {
                onCloseDialog()
            }, 5000)

            return () => {
                clearTimeout(timer)
            }
        }
    }, [isPending, onClose, onCloseDialog])

    useEffect(() => {
        if (isSuccess || isError) {
            onCloseDialog()
        }
    }, [isSuccess, isError, onCloseDialog])

    const { data: post } = usePostById(postId)

    return (
        <>
            {step === 1 && (
                <InfoDialog
                    isOpen={isOpen}
                    onClose={onCloseDialog}
                    onButtonClick={() => setStep(2)}
                />
            )}
            {step === 2 && (
                <Dialog isOpen={isOpen} onClose={onCloseDialog}>
                    <ReportFormCtn onSubmit={onSubmit}>
                        <ReportFormIntro />
                        <ReportContent content={post?.content} />
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
            <ReportFormSubmitting
                isOpen={isSubmitting}
                onClose={onCloseDialog}
            />
        </>
    )
}

function useCloseDialogFlow({
    resetForm,
    resetState,
    onClose,
    resetStep,
    onCloseTransition,
}: {
    resetForm: () => void
    resetState: () => void
    onClose: () => void
    resetStep: () => void
    onCloseTransition: () => void
}) {
    return () => {
        resetForm()
        resetState()
        onClose()
        resetStep()
        onCloseTransition()
    }
}
