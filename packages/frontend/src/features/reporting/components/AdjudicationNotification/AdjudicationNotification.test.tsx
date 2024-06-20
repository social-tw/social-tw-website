import { render, screen } from '@testing-library/react'
import AdjudicationNotification from './AdjudicationNotification'
import nock from 'nock'
import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { delay } from '@/utils/test-helpers'

jest.mock('@/features/core/hooks/useEpoch/useEpoch', () => ({
    useEpoch: () => ({
        currentEpoch: 2,
    }),
}))

describe('AdjudicationNotification', () => {
    it('should show notification if reports are not empty', async () => {
        const mockReports = [
            { id: 1, title: 'Report 1' },
            { id: 2, title: 'Report 2' },
        ]
        const expectation = nock(SERVER)
            .get('/api/reports')
            .reply(200, mockReports)

        render(<AdjudicationNotification />, { wrapper })

        const component = await screen.findByTestId('adjudication-notification')
        expect(component).toBeInTheDocument()
        expectation.done()
    })

    it('should hide notification if reports are empty', async () => {
        const expectation = nock(SERVER)
            .get('/api/reports')
            .reply(400, { error: 'Error' })

        render(<AdjudicationNotification />, { wrapper })
        await delay(1000)

        const component = screen.queryByTestId('adjudication-notification')
        expect(component).not.toBeInTheDocument()
        expectation.done()
    })
})
