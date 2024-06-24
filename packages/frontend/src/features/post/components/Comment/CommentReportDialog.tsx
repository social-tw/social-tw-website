import { Dialog } from '@/features/shared'
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
    const { report } = useReportComment()
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <ReportFormCtn>
                <ReportFormIntro />
                <ReportFormStepGroup>
                    <ReportFormStepLabel title="1. 檢舉原因" isRequired />
                    <ReportFormReasons />
                </ReportFormStepGroup>
                <ReportFormStepGroup>
                    <ReportFormStepLabel title="2. 檢舉描述" isRequired />
                    <ReportFormDesc />
                </ReportFormStepGroup>
                <ReportFormSubmitBtn onClick={report} />
            </ReportFormCtn>
        </Dialog>
    )
}
