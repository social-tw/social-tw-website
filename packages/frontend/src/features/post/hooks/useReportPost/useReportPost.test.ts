import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { useReportPost } from './useReportPost'

jest.mock('@/utils/helpers/getEpochKeyNonce', () => ({
    getEpochKeyNonce: jest.fn(),
}))

jest.mock('@/features/core/hooks/useWeb3Provider/useWeb3Provider', () => ({
    useWeb3Provider: () => ({
        getGuaranteedProvider: () => ({
            waitForTransaction: jest.fn().mockResolvedValue({
                logs: [
                    {
                        topics: ['', '', '1111', ''],
                    },
                ],
            }),
        }),
    }),
}))

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        userState: {
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
                calcEpochRemainingTime: jest.fn().mockReturnValue(120),
            },
        },
        getGuaranteedUserState: () => ({
            getData: () => [BigInt(2), BigInt(1), BigInt(0), BigInt(0)],
            waitForSync: jest.fn(),
            latestTransitionedEpoch: jest.fn().mockResolvedValue(1),
            genEpochKeyProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            genUserStateTransitionProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epoch',
            }),
            genProveReputationProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        }),
    }),
}))

describe('useReportPost', () => {
    it('should call relayReport api', async () => {
        const expectation = nock(SERVER)
            .post('/api/transition')
            .reply(200, { hash: '0xhash' })
            .post('/api/report')
            .reply(200, { reportId: '123' })

        const { result } = renderHook(useReportPost, { wrapper })
        let mockPostId = 'mocked_postId'
        let mockCategory = 1
        let mockReason = 'mocked_reason'
        await result.current.reportPost({
            postId: mockPostId,
            category: mockCategory,
            reason: mockReason,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expectation.done()
    })
})
