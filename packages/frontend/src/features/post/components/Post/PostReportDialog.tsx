import { Dialog } from '@/features/shared'
import { useReportPost } from '../../hooks/useReportPost'
import {
    ReportFormCtn,
    ReportFormDesc,
    ReportFormIntro,
    ReportFormReasons,
    ReportFormStepGroup,
    ReportFormStepLabel,
    ReportFormSubmitBtn,
} from '../ReportForm'

interface PostReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function PostReportDialog({ isOpen, onClose }: PostReportDialogProps) {
    const { report } = useReportPost()
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
