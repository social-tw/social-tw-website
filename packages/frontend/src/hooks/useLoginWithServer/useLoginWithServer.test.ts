import { act, renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useLoginWithServer } from './useLoginWithServer'

jest.spyOn(Storage.prototype, 'removeItem')

describe('useLoginWithServer', () => {
    it('should put signMsg to signature in localStorage', async () => {
        localStorage.setItem('signMsg', '"0xsignature"')
        const { result } = renderHook(useLoginWithServer, { wrapper })

        await act(async () => {
            await result.current.login()
        })

        const signature = localStorage.getItem('signature')

        expect(signature).toBe('"0xsignature"')
        expect(localStorage.removeItem).toHaveBeenCalledWith('signMsg')
    })
})
