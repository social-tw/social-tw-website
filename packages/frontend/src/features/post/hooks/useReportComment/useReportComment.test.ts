import { SERVER } from '@/constants/config'
import { ReportCategory } from '@/types/Report'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { useReportComment } from './useReportComment'

jest.mock('@/utils/helpers/getEpochKeyNonce', () => ({
    getEpochKeyNonce: jest.fn(),
}))

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        getGuaranteedUserState: () => ({
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
        }),
    }),
}))

describe('useReportPost', () => {
    it('should call relayReport api with proper params', async () => {
        const expectation = nock(SERVER)
            .post('/api/report')
            .reply(200, { reportId: '123' })

        const { result } = renderHook(useReportComment, { wrapper })
        let mockPostId = 'mocked_postId'
        let mockCommentId = 'mocked_commentId'
        let mockCategory = ReportCategory.ATTACK
        let mockReason = 'mocked_reason'
        await result.current.reportComment({
            postId: mockPostId,
            commentId: mockCommentId,
            category: mockCategory,
            reason: mockReason,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expectation.done()
    })
})
