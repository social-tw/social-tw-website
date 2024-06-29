import { useReportForm } from '@/features/post/hooks/useReportForm'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { render, screen } from '@testing-library/react'
import { PostReportDialog } from '../PostReportDialog'

jest.mock('../../../hooks/useReportForm')
jest.mock('../../ReportForm/ReportFormReasons', () => ({
    __esModule: true,
    ReportFormReasons: () => <div data-testid="report-form-reasons" />,
}))

const mockValues = {
    handleSubmit: jest.fn(),
    register: jest.fn(),
    errors: {},
    setValue: jest.fn(),
    getValues: jest.fn(),
    trigger: jest.fn(),
    isSubmitFailure: false,
    isSubmitting: false,
    isSubmitSuccess: false,
    isNotSubmitted: true,
    resetToCurrentState: jest.fn(),
    resetAll: jest.fn(),
    updateStateToFailure: jest.fn(),
    updateStateToSuccess: jest.fn(),
    updateStateToSubmitting: jest.fn(),
}

describe('PostReportDialog', () => {
    it('should render isNotSubmitted content', () => {
        const mockUseReportForm = useReportForm as jest.MockedFunction<
            typeof useReportForm
        >
        mockUseReportForm.mockReturnValue({ ...mockValues })
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

    it('should render isSubmitting content', () => {
        const mockUseReportForm = useReportForm as jest.MockedFunction<
            typeof useReportForm
        >
        mockUseReportForm.mockReturnValue({
            ...mockValues,
            isNotSubmitted: false,
            isSubmitting: true,
        })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(screen.getByText('您的檢舉報告正在送出中')).toBeInTheDocument()
    })

    it('should render isSubmitSuccess content', () => {
        const mockUseReportForm = useReportForm as jest.MockedFunction<
            typeof useReportForm
        >
        mockUseReportForm.mockReturnValue({
            ...mockValues,
            isNotSubmitted: false,
            isSubmitSuccess: true,
        })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(screen.getByText('您的檢舉報告傳送成功！')).toBeInTheDocument()
    })

    it('should render isSubmitFailure content', () => {
        const mockUseReportForm = useReportForm as jest.MockedFunction<
            typeof useReportForm
        >
        mockUseReportForm.mockReturnValue({
            ...mockValues,
            isNotSubmitted: false,
            isSubmitFailure: true,
        })
        render(
            <PostReportDialog postId={''} isOpen={true} onClose={() => {}} />,
            { wrapper },
        )
        expect(screen.getByText('導致傳送失敗。')).toBeInTheDocument()
    })
})
