import { useEpoch } from '@/hooks/useEpoch'
import { renderHook, waitFor } from '@testing-library/react'

jest.mock('@/hooks/useUserState', () => ({
    useUserState: () => ({
        userState: {
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(1),
                calcEpochRemainingTime: jest.fn().mockReturnValue(120),
            },
        },
    }),
}))

describe('useEpoch', () => {
    it('should load epoch information', async () => {
        const { result } = renderHook(() => useEpoch())

        await waitFor(() => {
            expect(result.current.epoch).toBe(1)
            expect(result.current.remainingTime).toBe(120)
        })
    })
})
