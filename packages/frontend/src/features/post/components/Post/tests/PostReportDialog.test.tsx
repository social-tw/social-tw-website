import { useReportPost } from '@/features/post/hooks/useReportPost/useReportPost'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { render, screen } from '@testing-library/react'
import { PostReportDialog } from '../PostReportDialog'

jest.mock('../../../hooks/useReportPost/useReportPost')
jest.mock('../../ReportForm/ReportFormCategories', () => ({
    __esModule: true,
    ReportFormCategories: () => <div data-testid="report-form-categories" />,
}))

const mockValues = {
    isPending: false,
    isIdle: false,
    isSuccess: false,
    isError: false,
    reset: jest.fn(),
    reportPost: jest.fn(),
}

describe('PostReportDialog', () => {
    it('should render isIdle content', () => {
        const mockUseReportPost = useReportPost as jest.MockedFunction<
            typeof useReportPost
        >
        mockUseReportPost.mockReturnValue({ ...mockValues, isIdle: true })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(
            screen.getByText(
                '若您確定要檢舉此內容，請選擇以下欄位中的原因，並填寫詳盡的檢舉描述。填寫完成後，您即可提交檢舉。',
            ),
        ).toBeInTheDocument()
    })

    it('should render isPending content', () => {
        const mockUseReportPost = useReportPost as jest.MockedFunction<
            typeof useReportPost
        >
        mockUseReportPost.mockReturnValue({ ...mockValues, isPending: true })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(screen.getByText('您的檢舉報告正在送出中')).toBeInTheDocument()
    })

    it('should render isSuccess content', () => {
        const mockUseReportPost = useReportPost as jest.MockedFunction<
            typeof useReportPost
        >
        mockUseReportPost.mockReturnValue({ ...mockValues, isSuccess: true })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(screen.getByText('您的檢舉報告傳送成功！')).toBeInTheDocument()
    })

    it('should render isError content', () => {
        const mockUseReportPost = useReportPost as jest.MockedFunction<
            typeof useReportPost
        >
        mockUseReportPost.mockReturnValue({ ...mockValues, isError: true })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(screen.getByText('導致傳送失敗。')).toBeInTheDocument()
    })
})
