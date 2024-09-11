import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { useWaitForTransactionReport } from './useWaitForTransactionReport'

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        getGuaranteedUserState: () => ({
            id: {
                secret: '0x123',
            },
            genProveReputationProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            genEpochKeyLiteProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
        }),
    }),
}))

jest.mock('@/features/core/hooks/useEpoch/useEpoch', () => ({
    useEpoch: () => ({
        currentEpoch: 2,
    }),
}))

describe('useWaitForTransactionReport', () => {
    afterEach(() => {
        nock.restore()
    })

    it('should fetch pending reports', async () => {
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
            .get(
                '/api/report?status=1&publicSignals=%22mocked_signals%22&proof=%22mocked_proof%22',
            )
            .reply(200, reports)

        const { result } = renderHook(useWaitForTransactionReport, {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(reports)

        expectation.done()
    })
})
