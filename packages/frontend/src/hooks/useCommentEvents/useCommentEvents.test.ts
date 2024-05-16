import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper";
import { useCommentEvents } from "./useCommentEvents";
import nock from 'nock';
import { SERVER } from '@/config';

describe('useCommentEvents', () => {
    it('should get comment event from socket', async () => {
        const { result } = renderHook(useCommentEvents, { wrapper })
    })
})
