import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useLoginWithWallet } from './useLoginWithWallet'

jest.spyOn(Storage.prototype, 'removeItem')

describe('useLoginWithWallet', () => {
    it('should sign hashUserId with wallet and save signature in localStorage', async () => {
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
            }),
        }

        localStorage.setItem('hashUserId', '100')
        const { result } = renderHook(useLoginWithWallet, { wrapper })

        await act(async () => {
            await result.current.login()
        })

        const signature = localStorage.getItem('signature')

        expect(window.ethereum.request).toHaveBeenCalled()
        expect(signature).toBeTruthy()
        expect(localStorage.removeItem).toHaveBeenCalledWith('hashUserId')
    })
})
