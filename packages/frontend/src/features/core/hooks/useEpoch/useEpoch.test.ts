import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useEpoch } from './useEpoch'

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

describe('useEpoch', () => {
    it('should get epoch time information', async () => {
        const { result } = renderHook(useEpoch, { wrapper })

        await waitFor(() => expect(result.current.currentEpoch).toBe(2))
        await waitFor(() => expect(result.current.remainingTime).toBe(120000))
        await waitFor(() => expect(result.current.epochLength).toBe(300000))
    })
})
