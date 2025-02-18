import ReportContent from '@/features/reporting/components/Adjudicate/ReportContent'
import { Dialog } from '@/features/shared'
import { useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useReportComment } from '../../hooks/useReportComment/useReportComment'
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

interface CommentReportDialogProps {
    postId: string
    commentId: string
    content: string
    isOpen: boolean
    onClose: () => void
}

const defaultValues = {
    [`${REGISTER_ID_REASON}`]: -1,
    [`${REGISTER_ID_DESC}`]: '',
}

export function CommentReportDialog({
    postId,
    commentId,
    content,
    isOpen,
    onClose,
}: CommentReportDialogProps) {
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
        reportComment,
        reset: resetState,
    } = useReportComment()

    const onSubmit = handleSubmit(async (data) => {
        try {
            await reportComment({
                postId,
                commentId,
                category: data[`${REGISTER_ID_REASON}`],
                reason: data[`${REGISTER_ID_DESC}`],
            })
        } catch (_error) {}
    })

    const onCloseDialog = useCloseDialogFlow({
        setIsSubmitting,
        resetForm,
        resetState,
        onClose,
    })

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null

        if (isPending) {
            setIsSubmitting(true)

            timer = setTimeout(() => {
                onCloseDialog()
            }, 5000)
        }

        if (!isPending && isSubmitting) {
            onCloseDialog()
        }

        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [isPending, isSubmitting, onCloseDialog])

    useEffect(() => {
        if (isSuccess || isError) {
            onCloseDialog()
        }
    }, [isSuccess, isError, onCloseDialog])

    return (
        <>
            <InfoDialog
                isOpen={isOpen && step === 1}
                onClose={onCloseDialog}
                onButtonClick={() => setStep(2)}
            />
            <Dialog isOpen={isOpen && step === 2} onClose={onCloseDialog}>
                <ReportFormCtn onSubmit={onSubmit}>
                    <ReportFormIntro />
                    <ReportContent content={content} />
                    <ReportFormStepGroup>
                        <ReportFormStepLabel title="1. 檢舉原因" isRequired />
                        <ReportFormCategories
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            trigger={trigger}
                        />
                    </ReportFormStepGroup>
                    <ReportFormStepGroup>
                        <ReportFormStepLabel title="2. 檢舉描述" isRequired />
                        <ReportFormReason register={register} errors={errors} />
                    </ReportFormStepGroup>
                    <ReportFormSubmitBtn />
                </ReportFormCtn>
            </Dialog>
            <ReportFormSubmitting
                isOpen={isSubmitting}
                onClose={onCloseDialog}
            />
        </>
    )
}

function useCloseDialogFlow({
    setIsSubmitting,
    resetForm,
    resetState,
    onClose,
}: {
    setIsSubmitting: (value: boolean) => void
    resetForm: () => void
    resetState: () => void
    onClose: () => void
}) {
    return () => {
        setIsSubmitting(false)
        resetForm()
        resetState()
        onClose()
    }
}
