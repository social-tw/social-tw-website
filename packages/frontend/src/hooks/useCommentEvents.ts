import { useEffect } from 'react'
import client from '@/socket'
import { useList } from '@uidotdev/usehooks'
import { CommentMsg } from '@/types/Comments'

export default function useCommentEvents(postId: string) {
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
    }, [])

    return {
        list,
        removeAt,
    }
}
