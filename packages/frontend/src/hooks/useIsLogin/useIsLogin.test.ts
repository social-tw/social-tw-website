import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useIsLogin } from './useIsLogin'
import { ethers } from 'ethers'
import { buildMockConfigAPI } from '@/utils/test-helpers/buildMockAPIs'

const providerSpy = jest.spyOn(ethers.providers, 'JsonRpcProvider')

jest.mock('@unirep/core')

describe('useIsLogin', () => {
    it('should return isLoggedIn and isLoggingIn', async () => {
        const { expectation } = buildMockConfigAPI()
        localStorage.setItem('signature', '"0xsignature"')

        const { result } = renderHook(useIsLogin, { wrapper })

        await waitFor(() => expect(result.current.isLoggedIn).toBe(true))
        expect(result.current.isLoggingIn).toBe(false)
    })
})
