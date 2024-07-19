import { Dialog } from '@/features/shared'
import { ReportCategory } from '@/types/Report'
import { FieldValues, useForm, UseFormGetValues } from 'react-hook-form'
import { useReportPost } from '../../hooks/useReportPost/useReportPost'
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
                category: ReportCategory.SPAM,
                reason: data[`${REGISTER_ID_DESC}`],
            })
        } catch (error) {}
    })

    const onCloseFailure = useCloseFailureDialogFlow({
        resetForm,
        resetState,
        getValues,
    })

    const onCloseSuccess = useCloseSuccessDialogFlow({
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
            {isError && <ReportFormSubmitFailure onClose={onCloseFailure} />}
            {isSuccess && <ReportFormSubmitSuccess onClose={onCloseSuccess} />}
        </>
    )
}

function useCloseSuccessDialogFlow({
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

function useCloseFailureDialogFlow({
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
