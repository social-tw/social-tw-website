import { ethers } from 'ethers'
import nock from 'nock'
import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper"
import { buildMockConfigAPI } from '@/utils/test-helpers/buildMockAPIs'
import { useWeb3Provider } from "./useWeb3Provider"

const providerSpy = jest.spyOn(ethers.providers, 'JsonRpcProvider')

describe('useWeb3Provider', () => {
    afterEach(() => {
        nock.restore()
        providerSpy.mockRestore()
    })

    it('should initialize JsonRpcProvider', async () => {
        const { expectation } = buildMockConfigAPI()

        const { result } = renderHook(useWeb3Provider, { wrapper })
        await waitFor(() => expect(result.current.provider).not.toBe(undefined))
    
        expect(providerSpy).toHaveBeenCalled()
        expectation.done()
    })
})
