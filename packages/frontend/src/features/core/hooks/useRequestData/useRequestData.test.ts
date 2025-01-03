import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { SERVER } from '@/constants/config'
import { useRequestData } from './useRequestData'

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
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        }),
    }),
}))

describe('useRequestData', () => {
    afterEach(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it('should request data', async () => {
        const expectation = nock(SERVER)
            .post('/api/request')
            .reply(200, { hash: '0xhash' })
        const { result } = renderHook(useRequestData, { wrapper })

        await act(async () => {
            await result.current.requestData({
                reqData: {
                    0: 'zero',
                    1: 'one',
                    2: 'two',
                },
                epkNonce: 1,
            })
        })

        expect(result.current.error).toBeFalsy()
        expectation.done()
    })
})
