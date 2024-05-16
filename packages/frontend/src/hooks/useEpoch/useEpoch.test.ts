import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper";
import { useEpoch } from "./useEpoch";

jest.mock('@/hooks/useUserState/useUserState', () => ({
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
    it('should return isLoggedIn and isLoggingIn', async () => {        
        const { result } = renderHook(useEpoch, { wrapper })
        
        await waitFor(() => {
            expect(result.current.currentEpoch).toBe(2),
            expect(result.current.remainingTime).toBe(120)
            expect(result.current.epochLength).toBe(300)
        })
    })
})