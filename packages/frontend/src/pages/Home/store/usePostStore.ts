import create from 'zustand'

const useStore = create((set) => ({
    posts: [], // store posts

    // update the vote count for a post
    updateVoteCount: (postId: any, upCount: any, downCount: any) =>
        set((state: { posts: any[] }) => ({
            posts: state.posts.map((post) =>
                post.id === postId
                    ? { ...post, upCount: upCount, downCount: downCount }
                    : post,
            ),
        })),
}))

export default useStore
