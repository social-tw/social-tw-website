import { Dialog } from '@/features/shared'
import { FieldValues, UseFormHandleSubmit } from 'react-hook-form'
import { useReportForm } from '../../hooks/useReportForm'
import { useReportPost } from '../../hooks/useReportPost'
import {
    REGISTER_ID_DESC,
    REGISTER_ID_REASON,
    ReportFormCtn,
    ReportFormDesc,
    ReportFormIntro,
    ReportFormReasons,
    ReportFormStepGroup,
    ReportFormStepLabel,
    ReportFormSubmitBtn,
    ReportFormSubmitFailure,
    ReportFormSubmitSuccess,
    ReportFormSubmitting,
} from '../ReportForm'

interface PostReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

const defaultValues = {
    [`${REGISTER_ID_REASON}`]: -1,
    [`${REGISTER_ID_DESC}`]: '',
}

export function PostReportDialog({ isOpen, onClose }: PostReportDialogProps) {
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

    const onSubmit = useSubmitReportFlow({
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

function useSubmitReportFlow({
    handleSubmit,
    updateStateToSubmitting,
    updateStateToFailure,
    updateStateToSuccess,
}: {
    handleSubmit: UseFormHandleSubmit<FieldValues>
    updateStateToSubmitting: () => void
    updateStateToFailure: () => void
    updateStateToSuccess: () => void
}) {
    const { report } = useReportPost()
    const reportFlow = async (data: any) => {
        try {
            updateStateToSubmitting()
            await report(data)
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
