import { Dialog } from '@/features/shared'
import { FieldValues, useForm, UseFormGetValues } from 'react-hook-form'
import { useReportComment } from '../../hooks/useReportComment/useReportComment'
import {
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
import { useEffect, useState } from 'react'

interface CommentReportDialogProps {
    postId: string
    commentId: string
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
    isOpen,
    onClose,
}: CommentReportDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    
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
        resetForm,
        resetState,
        onClose,
    })

     useEffect(() => {
         if (isPending) {
             setIsSubmitting(true)

             const timer = setTimeout(() => {
                 onCloseDialog()
             }, 5000)

             return () => {
                 clearTimeout(timer)
             }
         }
     }, [isPending, onCloseDialog])

    return (
        <>
            {isIdle && (
                <Dialog isOpen={isOpen} onClose={onCloseDialog}>
                    <ReportFormCtn onSubmit={onSubmit}>
                        <ReportFormIntro />
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
}: {
    resetForm: () => void
    resetState: () => void
    onClose: () => void
}) {
    return () => {
        resetForm()
        resetState()
        onClose()
    }
}
