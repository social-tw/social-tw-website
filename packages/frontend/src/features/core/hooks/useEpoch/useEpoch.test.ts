import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import { useEpoch } from './useEpoch'

// Mock useUserState
jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        userState: {
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
                calcEpochRemainingTime: jest.fn().mockReturnValue(120),
            },
        },
    }),
}))

// Mock useRelayConfig
jest.mock('@/features/core/hooks/useRelayConfig/useRelayConfig', () => ({
    useRelayConfig: () => ({
        data: {
            EPOCH_LENGTH: 300, // 300 seconds
        },
        isPending: false,
        isSuccess: true,
    }),
}))

describe('useEpoch', () => {
    it('should get epoch time information', async () => {
        const { result } = renderHook(useEpoch, { wrapper })

        await waitFor(() => expect(result.current.isPending).toBe(false))
        await waitFor(() => expect(result.current.currentEpoch).toBe(2))
        await waitFor(() => expect(result.current.remainingTime).toBe(120000))
        await waitFor(() => expect(result.current.epochLength).toBe(300000))
    })
})
