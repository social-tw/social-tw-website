import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useRelayConfig } from './useRelayConfig'
import nock from 'nock'
import { buildMockConfigAPI } from '@/utils/test-helpers/buildMockAPIs'

describe('useRelayConfig', () => {
    afterEach(() => {
        nock.restore()
    })

    it('should load config from relayer server', async () => {
        const { response, expectation } = buildMockConfigAPI()

        const { result } = renderHook(useRelayConfig, { wrapper })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
        expectation.done()
    })
})
