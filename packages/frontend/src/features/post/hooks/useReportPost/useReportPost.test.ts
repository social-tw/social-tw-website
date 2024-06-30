import { ReportCategory, ReportType } from '@/types/Report'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook } from '@testing-library/react'
import { useReportPost } from './useReportPost'

const mockRelayReport = jest.fn()
const mockEpochKey = 'mocked_epochKey'
const mockEpoch = 1
const mockGenEpochKeyProofResult = {
    epochKey: { toString: () => mockEpochKey },
    epoch: mockEpoch,
}

jest.mock('@/utils/helpers/getEpochKeyNonce', () => ({
    getEpochKeyNonce: jest.fn(),
}))

jest.mock('@/utils/api', () => ({
    relayReport: (data: any) => mockRelayReport(data),
}))

jest.mock('@/features/core', () => ({
    useUserState: () => ({
        getGuaranteedUserState: jest.fn().mockReturnValue({
            genEpochKeyProof: jest
                .fn()
                .mockReturnValue(mockGenEpochKeyProofResult),
        }),
    }),
    useActionCount: jest.fn().mockReturnValue(0),
}))

describe('useReportPost', () => {
    it('should call relayReport api with proper params', async () => {
        const { result } = renderHook(useReportPost, { wrapper })
        let mockPostId = 'mocked_postId'
        let mockCategory = ReportCategory.ATTACK
        let mockReason = 'mocked_reason'
        await result.current.reportPost({
            postId: mockPostId,
            category: mockCategory,
            reason: mockReason,
        })
        expect(mockRelayReport).toHaveBeenCalledTimes(1)
        expect(mockRelayReport).toHaveBeenCalledWith({
            proof: mockGenEpochKeyProofResult,
            type: ReportType.POST,
            objectId: mockPostId,
            reportorEpochKey: mockEpochKey,
            reason: mockReason,
            category: mockCategory,
            reportEpoch: mockEpoch,
        })
    })
})
