import { InfiniteData, QueryClient } from '@tanstack/react-query'
import { PostInfo, VoteAction, VoteMsg } from '@/types'

export const handleVoteEvent = (queryClient: QueryClient, msg: VoteMsg) => {
    queryClient.setQueryData<InfiniteData<PostInfo[]>>(['posts'], (oldData) => {
        // Iterate over all pages of posts
        const updatedPages = oldData?.pages.map((page) => {
            // Iterate over each post in a page
            return page.map((post) => {
                // Find the post that matches the postId from the vote message
                if (post.postId === msg.postId) {
                    // Update vote counts based on the action in the vote message
                    switch (msg.vote) {
                        case VoteAction.UPVOTE:
                            post.upCount += 1
                            break
                        case VoteAction.DOWNVOTE:
                            post.downCount += 1
                            break
                        case VoteAction.CANCEL_UPVOTE:
                            post.upCount -= 1
                            break
                        case VoteAction.CANCEL_DOWNVOTE:
                            post.downCount -= 1
                            break
                    }
                }
                return post // Return the updated or original post
            })
        })

        // Return the updated data structure expected by React Query
        return {
            pages: updatedPages ?? [],
            pageParams: oldData?.pageParams ?? [],
        }
    })
}
