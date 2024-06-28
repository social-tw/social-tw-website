import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { renderHook, waitFor } from '@testing-library/react'
import nock from 'nock'
import { getAdjudicateNullifier } from '../../utils/helpers'
import { useAdjudicate } from './useAdjudicate'

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        getGuaranteedUserState: () => ({
            id: {
                secret: '0x123',
            },
        }),
    }),
}))

describe('useAdjudicate', () => {
    it('should return the correct initial state', () => {
        const { result } = renderHook(() => useAdjudicate(), { wrapper })

        expect(result.current.isPending).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.data).toBeUndefined()
    })

    it('should handle adjudication success', async () => {
        const expectation = nock(SERVER)
            .post('/api/report/1', {
                adjudicateValue: 1,
                nullifier: getAdjudicateNullifier('0x123', '1').toString(),
                
            })
            .reply(200, {})

        const { result } = renderHook(() => useAdjudicate(), { wrapper })

        result.current.mutate({
            reportId: '1',
            adjudicateValue: 1,
        })
        
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.isError).toBe(false)
        expectation.done()
    })

    it('should handle adjudication error', async () => {
        const expectation = nock(SERVER)
            .post('/api/report/1', {
                adjudicateValue: 1,
                nullifier: getAdjudicateNullifier('0x123', '1').toString(),
                
            })
            .reply(400, {
                error: 'Error',
            })

        const { result } = renderHook(() => useAdjudicate(), { wrapper })

        result.current.mutate({
            reportId: '1',
            adjudicateValue: 1,
        })
        
        await waitFor(() => expect(result.current.isSuccess).toBe(false))
        expectation.done()
    })
})
