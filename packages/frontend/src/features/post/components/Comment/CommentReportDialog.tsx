import { Dialog } from '@/features/shared'
import { useForm } from 'react-hook-form'
import { useReportComment } from '../../hooks/useReportComment'
import {
    ReportFormCtn,
    ReportFormDesc,
    ReportFormIntro,
    ReportFormReasons,
    ReportFormStepGroup,
    ReportFormStepLabel,
    ReportFormSubmitBtn,
} from '../ReportForm'

interface CommentReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function CommentReportDialog({
    isOpen,
    onClose,
}: CommentReportDialogProps) {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        formState: { errors },
    } = useForm()

    const { report } = useReportComment()

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <ReportFormCtn onSubmit={handleSubmit(report)}>
                <ReportFormIntro />
                <ReportFormStepGroup>
                    <ReportFormStepLabel title="1. 檢舉原因" isRequired />
                    <ReportFormReasons
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        getValues={getValues}
                        trigger={trigger}
                    />
                </ReportFormStepGroup>
                <ReportFormStepGroup>
                    <ReportFormStepLabel title="2. 檢舉描述" isRequired />
                    <ReportFormDesc register={register} errors={errors} />
                </ReportFormStepGroup>
                <ReportFormSubmitBtn />
            </ReportFormCtn>
        </Dialog>
    )
}
