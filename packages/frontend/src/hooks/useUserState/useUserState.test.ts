import { ethers } from 'ethers'
import { UserState } from '@unirep/core'
import nock from 'nock'
import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { buildMockConfigAPI } from '@/utils/test-helpers/buildMockAPIs'
import { useUserState } from './useUserState'

const providerSpy = jest.spyOn(ethers.providers, 'JsonRpcProvider')

jest.mock('@unirep/core')

// jest.mocked(UserState).mockImplementation(() => {
//     return {
//         start: () => {},
//         waitForSync: () => {},
//     } as unknown as UserState
// })

describe('useUserState', () => {
    afterEach(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it('should initialize UserState', async () => {
        const { expectation } = buildMockConfigAPI()
        localStorage.setItem('signature', '"0xsignature"')

        const { result } = renderHook(useUserState, { wrapper })
        await waitFor(() => expect(result.current.userState).toBeTruthy())

        expect(providerSpy).toHaveBeenCalled()
        expect(UserState).toHaveBeenCalled()
        expectation.done()
    })
})
