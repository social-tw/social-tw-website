import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { useAdjudicate } from './useAdjudicate'

jest.mock('@/features/core/hooks/useWeb3Provider/useWeb3Provider', () => ({
    useWeb3Provider: () => ({
        getGuaranteedProvider: () => ({
            waitForTransaction: jest.fn().mockResolvedValue({
                logs: [
                    {
                        topics: ['', '', '', '1111'],
                    },
                ],
            }),
        }),
    }),
}))

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        userState: {
            id: {
                secret: '0x123',
            },
            getData: () => [BigInt(2), BigInt(1), BigInt(0), BigInt(0)],
            latestTransitionedEpoch: jest.fn().mockResolvedValue(2),
            genProveReputationProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        },
        getGuaranteedUserState: () => ({
            id: {
                secret: '0x123',
            },
            getData: () => [BigInt(2), BigInt(1), BigInt(0), BigInt(0)],
            latestTransitionedEpoch: jest.fn().mockResolvedValue(2),
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

jest.mock('@/features/core/utils/genReportIdentityProof', () => ({
    genReportIdentityProof: async () => ({
        publicSignals: 'mocked_signals',
        proof: 'mocked_proof',
        epoch: 2,
        epochKey: 'mocked_epockKey',
    }),
}))

describe('useAdjudicate', () => {
    it('should return the correct initial state', () => {
        const { result } = renderHook(() => useAdjudicate(), { wrapper })

        expect(result.current.isPending).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.data).toBeUndefined()
    })

    it('should handle adjudication success', async () => {
        const expectation = nock(SERVER).post('/api/report/1').reply(200, {})

        const { result } = renderHook(() => useAdjudicate(), { wrapper })

        result.current.mutate({
            reportId: '1',
            adjudicateValue: 1,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.isError).toBe(false)
        expectation.done()
    })

    it('should handle adjudication error', async () => {
        nock(SERVER).post('/api/report/1').reply(400, {
            error: 'Error',
        })

        const { result } = renderHook(() => useAdjudicate(), { wrapper })

        result.current.mutate({
            reportId: '1',
            adjudicateValue: 1,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(false))
    })
})
