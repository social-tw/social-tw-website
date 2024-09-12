import { wrapper } from '@/utils/test-helpers/wrapper'
import { render, screen } from '@testing-library/react'
import { useAdjudicate } from '../../hooks/useAdjudicate/useAdjudicate'
import Adjudicate from './Adjudicate'
import { ReportData } from './AdjudicateForm'

jest.mock('../../hooks/useAdjudicate/useAdjudicate')

const mockUseAdjudicate = useAdjudicate as jest.Mock

describe('Adjudicate', () => {
    const reportData: ReportData = {
        id: '1',
        content:
            '和幾個好友一起探索了台灣的小巷弄，發現了一家隱藏版的小吃店，美味的古早味讓我們瞬間回味童年。這次的冒險不僅填飽了肚子，更充實了心靈。人生就是要不斷發現驚喜，就算在家鄉也能有無限的探',
        category: 2,
        reason: '偷偷置入性廣告，不OK餒！',
    }

    it('should render nothing if reportData is not provided', () => {
        mockUseAdjudicate.mockReturnValue({
            mutate: jest.fn(),
            isPending: false,
            isSuccess: false,
            isError: false,
            reset: jest.fn(),
        })
        const { container } = render(<Adjudicate />, { wrapper })
        expect(container).toBeEmptyDOMElement()
    })

    it('should render AdjudicateDialog when open is true', () => {
        mockUseAdjudicate.mockReturnValue({
            mutate: jest.fn(),
            isPending: false,
            isSuccess: false,
            isError: false,
            reset: jest.fn(),
        })
        render(<Adjudicate reportData={reportData} open />, { wrapper })
        expect(screen.getByText(/^檢舉案件$/)).toBeInTheDocument()
        expect(screen.getByText(/^由你來評判$/)).toBeInTheDocument()
    })

    it('should render AdjudicatePending when isPending is true', () => {
        mockUseAdjudicate.mockReturnValue({
            mutate: jest.fn(),
            isPending: true,
            isSuccess: false,
            isError: false,
            reset: jest.fn(),
        })
        render(<Adjudicate reportData={reportData} />, { wrapper })
        expect(screen.getByText(/您的檢舉評判正在送出中/)).toBeInTheDocument()
    })

    it('should render AdjudicateSuccess when isSuccess is true', () => {
        mockUseAdjudicate.mockReturnValue({
            mutate: jest.fn(),
            isPending: false,
            isSuccess: true,
            isError: false,
            reset: jest.fn(),
        })
        render(<Adjudicate reportData={reportData} />, { wrapper})
        expect(screen.getByText(/感謝您協助參與檢舉評判！/)).toBeInTheDocument()
    })

    it('should render AdjudicateFailure when isError is true', () => {
        mockUseAdjudicate.mockReturnValue({
            mutate: jest.fn(),
            isPending: false,
            isSuccess: false,
            isError: true,
            reset: jest.fn(),
        })
        render(<Adjudicate reportData={reportData} />, { wrapper })
        expect(screen.getByText(/請您再次嘗試評判檢舉案件/)).toBeInTheDocument()
    })
})
