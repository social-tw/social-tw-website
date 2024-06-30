import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { useFetchReports } from './useFetchReports'

jest.mock('@/features/core/hooks/useEpoch/useEpoch', () => ({
    useEpoch: () => ({
        currentEpoch: 2,
    }),
}))

describe('useFetchReports', () => {
    afterEach(() => {
        nock.restore()
    })

    it('should fetch reports successfully', async () => {
        const mockReports = [
            { id: 1, title: 'Report 1' },
            { id: 2, title: 'Report 2' },
        ]
        const expectation = nock(SERVER)
            .get('/api/reports')
            .reply(200, mockReports)

        const { result } = renderHook(() => useFetchReports(), {
            wrapper,
        })

        expect(result.current.data).toBeUndefined()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expectation.done()
        expect(result.current.data).toEqual(mockReports)
    })
})
