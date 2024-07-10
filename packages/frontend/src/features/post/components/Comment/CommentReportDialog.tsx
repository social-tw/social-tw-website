import { Dialog } from '@/features/shared'
import { ReportCategory } from '@/types/Report'
import { FieldValues, UseFormHandleSubmit } from 'react-hook-form'
import { useReportComment } from '../../hooks/useReportComment/useReportComment'
import { useReportForm } from '../../hooks/useReportForm'
import {
    REGISTER_ID_DESC,
    REGISTER_ID_REASON,
    ReportFormCategories,
    ReportFormCtn,
    ReportFormDesc,
    ReportFormIntro,
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
        handleSubmit,
        register,
        errors,
        setValue,
        getValues,
        trigger,
        isSubmitFailure,
        isSubmitting,
        isSubmitSuccess,
        isNotSubmitted,
        resetToCurrentState,
        resetAll,
        updateStateToFailure,
        updateStateToSuccess,
        updateStateToSubmitting,
    } = useReportForm(defaultValues)

    const onSubmit = useSubmitCommentFlow({
        postId,
        commentId,
        handleSubmit,
        updateStateToSubmitting,
        updateStateToFailure,
        updateStateToSuccess,
    })

    const onCloseSuccess = useCloseSuccessDialogFlow({ resetAll, onClose })

    return (
        <>
            {isNotSubmitted && (
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
                            <ReportFormDesc
                                register={register}
                                errors={errors}
                            />
                        </ReportFormStepGroup>
                        <ReportFormSubmitBtn />
                    </ReportFormCtn>
                </Dialog>
            )}
            {isSubmitting && <ReportFormSubmitting />}
            {isSubmitFailure && (
                <ReportFormSubmitFailure onClose={resetToCurrentState} />
            )}
            {isSubmitSuccess && (
                <ReportFormSubmitSuccess onClose={onCloseSuccess} />
            )}
        </>
    )
}

function useSubmitCommentFlow({
    postId,
    commentId,
    handleSubmit,
    updateStateToSubmitting,
    updateStateToFailure,
    updateStateToSuccess,
}: {
    postId: string
    commentId: string
    handleSubmit: UseFormHandleSubmit<FieldValues>
    updateStateToSubmitting: () => void
    updateStateToFailure: () => void
    updateStateToSuccess: () => void
}) {
    const { reportComment } = useReportComment()
    const reportFlow = async (data: FieldValues) => {
        try {
            updateStateToSubmitting()
            await reportComment({
                postId,
                commentId,
                category: ReportCategory.SPAM, // TODO: should use real relay data report category
                reason: data[`${REGISTER_ID_DESC}`],
            })
            updateStateToSuccess()
        } catch (e) {
            updateStateToFailure()
        }
    }
    return handleSubmit(reportFlow)
}

function useCloseSuccessDialogFlow({
    resetAll,
    onClose,
}: {
    resetAll: () => void
    onClose: () => void
}) {
    return () => {
        resetAll()
        onClose()
    }
}
