import { renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useVoteEvents } from './useVoteEvents'

describe('useVoteEvents', () => {
    it.skip('should get vote event from socket', async () => {
        const { result } = renderHook(useVoteEvents, { wrapper })
    })
})
