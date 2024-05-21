import { useEffect } from 'react'
import { useList } from '@uidotdev/usehooks'
import client from '@/utils/helpers/socket'
import type { CommentMsg } from '@/types/Comments'

export function useCommentEvents(postId: string) {
    const [list, { push, removeAt }] = useList<CommentMsg>([])

    useEffect(() => {
        function handleCommentEvent(data: CommentMsg) {
            if (data.postId !== postId) return
            push(data)
        }

        const unsubscribe = client.onCommentEvent(handleCommentEvent)

        return () => {
            unsubscribe()
        }
    }, [postId, push])

    return {
        list,
        removeAt,
    }
}
