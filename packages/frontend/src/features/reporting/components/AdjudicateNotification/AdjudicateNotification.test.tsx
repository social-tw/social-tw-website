import { SERVER } from '@/constants/config'
import { delay } from '@/utils/test-helpers'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { render } from '@testing-library/react'
import nock from 'nock'
import AdjudicationNotification from './AdjudicateNotification'

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        getGuaranteedUserState: () => ({
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
                settings: {
                    numEpochKeyNoncePerEpoch: 3,
                },
            },
        }),
    }),
}))

jest.mock('@/features/core/hooks/useEpoch/useEpoch', () => ({
    useEpoch: () => ({
        currentEpoch: 2,
    }),
}))

describe('AdjudicationNotification', () => {
    it('should show notification if reports are not empty', async () => {
        const reports = [
            {
                reportId: '1',
                objectId: '1',
                category: 2,
                reason: '偷偷置入性廣告，不OK餒！',
                reportorEpochKey: '',
                respondentEpochKey: '',
                adjudicatorsNullifier: [],
                createdAt: '2022-01-01T00:00:00.000Z',
                updatedAt: '2022-01-01T00:00:00.000Z',
            },
        ]

        const expectation = nock(SERVER)
            .get('/api/report?status=0')
            .reply(200, reports)

        render(<AdjudicationNotification />, { wrapper })
        await delay(1000)

        expectation.done()
    })

    it('should hide notification if reports are empty', async () => {
        const expectation = nock(SERVER)
            .get('/api/report?status=0')
            .reply(400, { error: 'Error' })

        render(<AdjudicationNotification />, { wrapper })
        await delay(1000)

        expectation.done()
    })
})
