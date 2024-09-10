import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { act, renderHook } from '@testing-library/react'
import nock from 'nock'
import { useReportAdjudicatorReputation } from './useReportAdjudicatorReputation'

jest.mock('@/features/core/hooks/useWeb3Provider/useWeb3Provider', () => ({
    useWeb3Provider: () => ({
        getGuaranteedProvider: () => ({
            waitForTransaction: jest.fn(),
        }),
    }),
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
                epochKey: 'mocked_epockKey',
            }),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        }),
    }),
}))

jest.mock('@/features/core/utils/genReportNullifierProof', () => ({
    genReportNullifierProof: async () => ({
        publicSignals: 'mocked_signals',
        proof: 'mocked_proof',
    }),
}))

describe('useReportAdjudicatorReputation', () => {
    afterEach(() => {
        nock.restore()
    })

    it('should claim reputation with ReportEpochKeyProof', async () => {
        const expectation = nock(SERVER)
            .post('/api/transition')
            .reply(200, { hash: '0xhash' })
            .post('/api/reputation/claim')
            .reply(200, { message: { txHash: '0xhash' } })

        const { result } = renderHook(() => useReportAdjudicatorReputation(), {
            wrapper: wrapper,
        })

        await act(async () => {
            await result.current.mutateAsync('1')
        })

        expect(result.current.error).toBeFalsy()
        expectation.done()
    })
})
