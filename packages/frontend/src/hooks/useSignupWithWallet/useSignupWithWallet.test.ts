import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper"
import { useSignupWithWallet } from "./useSignupWithWallet"
import { SERVER } from '@/config'

jest.spyOn(Storage.prototype, 'removeItem');

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

describe('useSignupWithWallet', () => {
    afterEach(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it('should signup using hashUserId and token in localStorage', async () => {
        const expectation = nock(SERVER).post('/api/signup').reply(200, { status: 'success', hash: '0xhash'})
        ;(window as any).ethereum = {
          request: jest.fn().mockImplementation(async (payload) => {
          const { method } = payload
          switch (method) {
              case 'eth_requestAccounts': {
              return ['0xaccount1', '0xaccount2']
              }
              case 'personal_sign': {
              return '0xsignature'
              }
          }
          })
      }
        localStorage.setItem('hashUserId', '\"100\"')
        localStorage.setItem('token', '\"token\"')
        const { result } = renderHook(useSignupWithWallet, { wrapper })

        await act(async () => {
            await result.current.signup()
        })

        expect(result.current.error).toBeFalsy()
        expectation.done()
    })
})
