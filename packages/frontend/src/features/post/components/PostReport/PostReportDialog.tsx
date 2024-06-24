import { Dialog } from '@/features/shared'
import { PostReportContainer } from './PostReportContainer'
import { PostReportDescription } from './PostReportDescription'
import { PostReportIntro } from './PostReportIntro'
import { PostReportReasons } from './PostReportReasons'
import { PostReportStepGroup, PostReportStepLabel } from './PostReportStep'
import { PostReportSubmitBtn } from './PostReportSubmitBtn'

interface PostReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function PostReportDialog({ isOpen, onClose }: PostReportDialogProps) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <PostReportContainer>
                <PostReportIntro />
                <PostReportStepGroup>
                    <PostReportStepLabel title="1. 檢舉原因" isRequired />
                    <PostReportReasons />
                </PostReportStepGroup>
                <PostReportStepGroup>
                    <PostReportStepLabel title="2. 檢舉描述" isRequired />
                    <PostReportDescription />
                </PostReportStepGroup>
                <PostReportSubmitBtn />
            </PostReportContainer>
        </Dialog>
    )
}
