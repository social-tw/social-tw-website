import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useSignup } from './useSignup'
import { SERVER } from '@/constants/config'

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
            genUserSignUpProof: jest.fn().mockResolvedValue({
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

describe('useSignup', () => {
    afterEach(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it('should signup', async () => {
        const expectation = nock(SERVER)
            .post('/api/signup')
            .reply(200, { status: 'success', hash: '0xhash' })
        const { result } = renderHook(useSignup, { wrapper })

        await act(async () => {
            await result.current.signup({
                hashUserId: '100',
                accessToken: 'token',
                fromServer: true,
            })
        })

        expect(result.current.error).toBeFalsy()
        expectation.done()
    })
})
