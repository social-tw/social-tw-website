import { act, renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useLogout } from './useLogout'

jest.spyOn(Storage.prototype, 'removeItem')

describe('useLogout', () => {
    it('should reset localStorage', async () => {
        const { result } = renderHook(useLogout, { wrapper })

        await act(async () => {
            await result.current.logout()
        })

        expect(localStorage.removeItem).toHaveBeenCalledWith('signature')
    })
})
