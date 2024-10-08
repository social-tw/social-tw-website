import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { SERVER } from '@/constants/config'
import { useSignupWithServer } from './useSignupWithServer'

jest.spyOn(Storage.prototype, 'removeItem')

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

describe('useSignupWithServer', () => {
    afterEach(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it('should signup using hashUserId and token in localStorage', async () => {
        const expectation = nock(SERVER)
            .post('/api/signup')
            .reply(200, { status: 'success', hash: '0xhash' })
        localStorage.setItem('hashUserId', '"100"')
        localStorage.setItem('token', '"token"')
        localStorage.setItem('signMsg', '"0xsignature"')
        const { result } = renderHook(useSignupWithServer, { wrapper })

        await act(async () => {
            await result.current.signup()
        })

        expect(result.current.error).toBeFalsy()
        expectation.done()
    })
})
