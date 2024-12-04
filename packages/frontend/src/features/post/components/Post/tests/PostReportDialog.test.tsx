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
    isSuccess: false,
    isError: false,
    reset: jest.fn(),
    reportPost: jest.fn(),
}

describe('PostReportDialog', () => {
    it('should render the initial form content', () => {
        const mockUseReportPost = useReportPost as jest.MockedFunction<
            typeof useReportPost
        >

        mockUseReportPost.mockReturnValue({ ...mockValues })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(screen.getByText('確認檢舉')).toBeInTheDocument()
    })
})
