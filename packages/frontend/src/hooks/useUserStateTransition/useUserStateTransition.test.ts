import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useUserStateTransition } from './useUserStateTransition'
import { SERVER } from '@/config'

jest.mock('@/hooks/useWeb3Provider/useWeb3Provider', () => ({
    useWeb3Provider: () => ({
        getGuaranteedProvider: () => ({
            waitForTransaction: jest.fn(),
        }),
    }),
}))

jest.mock('@/hooks/useUserState/useUserState', () => ({
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

describe('useUserStateTransition', () => {
    afterEach(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it('should execute state transition for user', async () => {
        const expectation = nock(SERVER)
            .post('/api/transition')
            .reply(200, { hash: '0xhash' })
        const { result } = renderHook(useUserStateTransition, { wrapper })

        await act(async () => {
            await result.current.stateTransition()
        })

        expect(result.current.error).toBeFalsy()
        expectation.done()
    })
})
