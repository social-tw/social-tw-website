import { useUser } from '@/contexts/User'
import { PostInfo, PostStatus } from '@/types'
import { fetchSinglePost } from '@/utils/api'
import checkVoteIsMine from '@/utils/checkVoteIsMine'
import { useQuery } from '@tanstack/react-query'

export default function useFetchSinglePost(postId?: string) {
    const { userState } = useUser()
    const {
        data: fetchedPost,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['singlePost', postId],
        queryFn: () =>
            postId
                ? fetchSinglePost(postId)
                : Promise.reject(new Error('postId is undefined')),
        enabled: !!postId,
    })

    if (!fetchedPost)
        return {
            data: undefined,
            isLoading,
            error,
        }

    let isMine = false
    let finalAction = null
    if (userState) {
        const voteCheck = checkVoteIsMine(fetchedPost.votes, userState)
        isMine = voteCheck.isMine
        finalAction = voteCheck.finalAction
    }

    const post: PostInfo = {
        id: fetchedPost._id,
        postId: fetchedPost.postId,
        epochKey: fetchedPost.epochKey,
        content: fetchedPost.content,
        publishedAt: new Date(Number(fetchedPost.publishedAt)),
        commentCount: fetchedPost.commentCount,
        upCount: fetchedPost.upCount,
        downCount: fetchedPost.downCount,
        isMine: isMine,
        finalAction: finalAction,
        status: PostStatus.Success,
    }

    return {
        data: post,
        isLoading,
        error,
    }
}
