import { renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useCommentEvents } from './useCommentEvents'

describe('useCommentEvents', () => {
    it.skip('should get comment event from socket', async () => {
        const { result } = renderHook(useCommentEvents, { wrapper })
    })
})
