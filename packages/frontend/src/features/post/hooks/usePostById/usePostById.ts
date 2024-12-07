import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import { PostService } from '@/features/core'

export function usePostById(id: string) {
    return useQuery({
        queryKey: [QueryKeys.SinglePost, id],
        queryFn: async () => {
            if (!id) return undefined
            const postService = new PostService()
            return postService.fetchPostById(id)
        },
        enabled: !!id,
    })
}
