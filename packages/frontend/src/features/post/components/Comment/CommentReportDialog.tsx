import { Dialog } from '@/features/shared'
import { ReportCategory } from '@/types/Report'
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
                category: ReportCategory.SPAM,
                reason: data[`${REGISTER_ID_DESC}`],
            })
        } catch (_error) {}
    })

    const onFailureResubmit = useFailureResubmitDialogFlow({
        resetForm,
        resetState,
        getValues,
    })

    const onCloseDialog = useCloseDialogFlow({
        resetForm,
        resetState,
        onClose,
    })

    return (
        <>
            {isIdle && (
                <Dialog isOpen={isOpen} onClose={onClose}>
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
