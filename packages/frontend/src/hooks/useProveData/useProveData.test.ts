import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useProveData } from './useProveData'

jest.mock('@/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        getGuaranteedUserState: () => ({
            chainId: 1,
            waitForSync: jest.fn(),
            latestTransitionedEpoch: jest.fn().mockResolvedValue(1),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        }),
    }),
}))

describe('useProveData', () => {
    afterEach(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it.skip('should prove data', async () => {
        const { result } = renderHook(useProveData, { wrapper })

        await act(async () => {
            await result.current.proveData({
                0: 'zero',
                1: 'one',
                2: 'two',
            })
        })
    })
})
