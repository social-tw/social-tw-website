import { act, renderHook, waitFor } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper";
import { useLogin } from "./useLogin";

jest.spyOn(Storage.prototype, 'setItem');

describe('useLogin', () => {
    it('should set signature in localStorage', async () => {
        const signature = '0xsignature'
        const { result } = renderHook(useLogin, { wrapper })

        await act(async () => {
          await result.current.login({ signature })
        })
    
        expect(localStorage.setItem).toHaveBeenCalledWith('signature', '\"0xsignature\"')
    })
})