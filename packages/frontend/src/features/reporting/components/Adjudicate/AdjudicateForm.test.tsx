import { ReportCategory } from '@/constants/report'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { render } from '@testing-library/react'
import AdjudicateForm from './AdjudicateForm'

describe('AdjudicateForm', () => {
    it.skip('should render the form', async () => {
        const reportData = {
            id: '1',
            category: ReportCategory.Solicitation,
            reason: '偷偷置入性廣告，不OK餒！',
            content:
                '和幾個好友一起探索了台灣的小巷弄，發現了一家隱藏版的小吃店，美味的古早味讓我們瞬間回味童年。這次的冒險不僅填飽了肚子，更充實了心靈。人生就是要不斷發現驚喜，就算在家鄉也能有無限的探',
            createdAt: '2022-01-01T00:00:00.000Z',
            updatedAt: '2022-01-01T00:00:00.000Z',
        }

        render(<AdjudicateForm reportData={reportData} />, { wrapper })

        // const component = await screen.findByTestId('adjudication-form')
        // expect(component).toBeInTheDocument()
    })
})
