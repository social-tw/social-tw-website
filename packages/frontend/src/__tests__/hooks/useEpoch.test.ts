import useEpoch from '@/hooks/useEpoch'
import { renderHook, waitFor } from '@testing-library/react'

jest.mock('@/hooks/useUserState', () => ({
    userState: {
        sync: {
            calcEpochRemainingTime: jest.fn().mockReturnValue(100),
            calcCurrentEpoch: jest.fn().mockReturnValue(9999),
        },
    },
}))

describe('useEpoch', () => {
    it('should load epoch information', async () => {
        const { result } = renderHook(() => useEpoch())

        await waitFor(() => {
            expect(result.current.epoch).toBe(9999)
            expect(result.current.remainingTime).toBe(100)
        })
    })
})
