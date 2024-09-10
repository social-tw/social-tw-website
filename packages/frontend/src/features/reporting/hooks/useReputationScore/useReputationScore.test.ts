import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import { useReputationScore } from './useReputationScore'

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        userState: {
            id: '1',
            getData: jest.fn().mockResolvedValue([10, 5, 0, 0])
        },
    }),
}))

describe('useReputationScore', () => {
    it('should return the reputation score', async () => {
        const { result } = renderHook(() => useReputationScore(), {
            wrapper: wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.reputationScore).toEqual(5)
        expect(result.current.isValidReputationScore).toBe(true)
    })
})
