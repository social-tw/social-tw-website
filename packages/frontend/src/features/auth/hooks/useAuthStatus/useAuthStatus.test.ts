import { ethers } from 'ethers'
import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { buildMockConfigAPI } from '@/utils/test-helpers/buildMockAPIs'
import { useAuthStatus } from './useAuthStatus'

jest.spyOn(ethers.providers, 'JsonRpcProvider')

jest.mock('@unirep/core')

describe('useAuthStatus', () => {
    it('should return isLoggedIn and isLoggingIn', async () => {
        const { expectation } = buildMockConfigAPI()
        localStorage.setItem('signature', '"0xsignature"')

        const { result } = renderHook(useAuthStatus, { wrapper })

        await waitFor(() => expect(result.current.isLoggedIn).toBe(true))
        await waitFor(() => expect(result.current.isLoggingIn).toBe(false))
        expectation.done()
    })
})
