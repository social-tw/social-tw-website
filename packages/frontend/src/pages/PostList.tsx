import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dialog from '@/components/common/Dialog'
import SignupLoadingModal from '@/components/login/SignupPendingTransition'
import Post from '@/components/post/Post'
import PostForm, { PostValues } from '@/components/post/PostForm'
import { SERVER } from '@/config'
import { useUser } from '@/contexts/User'
import useCreatePost from '@/hooks/useCreatePost'
import { CancelledTaskError } from '@/utils/makeCancellableTask'
import {
    DefaultError,
    InfiniteData,
    QueryKey,
    useInfiniteQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useIntersectionObserver, useMediaQuery } from '@uidotdev/usehooks'

import type { PostInfo } from '@/types'

const examplePosts = [
    {
        id: 'demo-1',
        epochKey: 'epochKey-1',
        publishedAt: new Date(),
        content:
            '今天真是一個美好的日子！我終於完成了我夢寐以求的目標：跑完全馬拉松！這個挑戰對我來說真的非常艱巨，但我堅持下來了。在這個過程中，我學到了很多關於毅力和奮鬥的價值。我要特別感謝我的家人和朋友對我一直以來的支持和鼓勵。無論你們在生活中面對什麼困難，只要你們相信自己，付出努力，你們一定可以實現自己的目標！今天，我真心覺得自己是最幸運的人。',
        commentCount: 0,
        upCount: 0,
        downCount: 0,
    },
    {
        id: 'demo-2',
        epochKey: 'epochKey-2',
        publishedAt: new Date(),
        content:
            '最近我剛看完一本非常棒的書，推薦給大家！這本書叫做《思考快與慢》，作者是丹尼爾·卡尼曼。這本書深入探討了人類思考的方式和偏見。它教會了我們如何辨識和避免那些常常影響我們判斷力的錯誤和陷阱。我學到了很多關於認知心理學的知識，這些知識不僅適用於個人生活，還能幫助我們在工作和人際關係中做出更明智的決策。如果你對心理學或者是提升自己的思考能力感興趣，這本書絕對是值得一讀的！',
        commentCount: 0,
        upCount: 0,
        downCount: 0,
    },
    {
        id: 'demo-3',
        epochKey: 'epochKey-3',
        publishedAt: new Date(),
        content:
            '剛剛和一群好友一起參加了一場令人驚喜的音樂會！我們聽到了一位非常出色的音樂家演奏，他的技巧和激情真是讓人難以置信。音樂會的現場氣氛也非常棒，大家都在跟著節奏搖擺，沉浸在美妙的音樂中。音樂總是有種神奇的力量，它能夠觸動人心，帶給我們情緒的共鳴。這次音樂會真的讓我重新燃起對音樂的熱愛，我想以後會更積極地參加各種音樂活動。如果你也喜歡音樂，不妨多花時間去欣賞和體驗。',
        commentCount: 0,
        upCount: 0,
        downCount: 0,
    },
]

export default function PostList() {
    const { isLogin, signupStatus } = useUser()
    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        if (isLogin) {
            setTimeout(() => {
                setIsShow(false)
            }, 1500)
        } else {
            setIsShow(true)
        }
    }, [isLogin])

    const queryClient = useQueryClient()

    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery<
        PostInfo[],
        DefaultError,
        InfiniteData<PostInfo[]>,
        QueryKey,
        number
    >({
        queryKey: ['posts'],
        queryFn: async ({ pageParam }) => {
            const res = await fetch(`${SERVER}/api/post?page=` + pageParam)
            const data = await res.json()
            const posts = data.map((item: any) => ({
                id: item._id,
                epochKey: item.epochKey,
                content: item.content,
                publishedAt: new Date(Number(item.publishedAt)),
                commentCount: item.commentCount,
                upCount: item.upCount,
                downCount: item.downCount,
            }))
            return posts
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length === 0) {
                return undefined
            }
            return lastPageParam + 1
        },
        placeholderData: {
            pages: [examplePosts],
            pageParams: [0],
        },
    })

    const [pageBottomRef, entry] = useIntersectionObserver({
        threshold: 0,
        root: null,
        rootMargin: '10%',
    })

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) {
            fetchNextPage()
        }
    }, [entry])

    const navigate = useNavigate()

    const { create, cancel, reset, isCancellable, isCancelled } =
        useCreatePost()

    const [isOpenError, setIsOpenError] = useState(false)
    const onSubmit = async (values: PostValues) => {
        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            await create(values.content)

            const newPost = {
                id: `temp-${nanoid()}`,
                epochKey: nanoid(),
                content: values.content,
                publishedAt: new Date(),
                commentCount: 0,
                upCount: 0,
                downCount: 0,
            }
            queryClient.setQueryData(
                ['posts'],
                (old: InfiniteData<PostInfo[]>) => ({
                    pages: [[newPost], ...old.pages],
                    pageParams: old.pageParams,
                }),
            )

            toast('貼文成功送出')
        } catch (err) {
            if (err instanceof CancelledTaskError) {
                reset()
            } else {
                setIsOpenError(true)
            }

            queryClient.setQueryData(['post'], previousPostsData)
        }
    }

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <div
            className={clsx(
                `px-4`,
                !isSmallDevice && 'divide-y divide-neutral-600',
                location.pathname === '/login' &&
                    'max-w-[600px] w-11/12 h-screen my-[200px]',
            )}
        >
            {!isSmallDevice && location.pathname !== '/login' && (
                <section className="relative py-6">
                    {signupStatus !== 'default' && isShow && (
                        <SignupLoadingModal
                            status={signupStatus}
                            isOpen={true}
                            opacity={0}
                        />
                    )}
                    <PostForm
                        onCancel={() => navigate('/')}
                        onSubmit={onSubmit}
                        onSubmitCancel={cancel}
                        isSubmitCancellable={isCancellable}
                        isSubmitCancelled={isCancelled}
                        disabled={signupStatus === 'default' ? false : isShow}
                    />
                </section>
            )}
            <section className="py-6">
                <ul className={clsx(isSmallDevice ? 'space-y-3' : 'space-y-6')}>
                    {data?.pages.map((group, i) => (
                        <Fragment key={i}>
                            {group.map((post) => (
                                <li
                                    key={post.id}
                                    className="transition-opacity duration-500"
                                >
                                    <Post
                                        id={post.id}
                                        epochKey={post.epochKey}
                                        content={post.content}
                                        publishedAt={post.publishedAt}
                                        commentCount={post.commentCount}
                                        upCount={post.upCount}
                                        downCount={post.downCount}
                                        compact
                                    />
                                </li>
                            ))}
                        </Fragment>
                    ))}
                </ul>
                <div
                    ref={pageBottomRef}
                    className="w-full h-1 bg-transparent"
                />
            </section>
            <Dialog isOpen={isOpenError} onClose={() => setIsOpenError(false)}>
                <section className="p-6 md:px-12">
                    <p className="text-base font-medium text-black/90">
                        親愛的用戶：
                        <br />
                        <br />
                        很抱歉通知您，我們注意到您的貼文發布時似乎遇到了網路連線不穩定的情況，導致發文失敗。我們深感抱歉給您帶來的不便。請您再次嘗試發佈文章{' '}
                        <br />
                        <br />
                        感謝您的理解與合作。
                    </p>
                </section>
                <section className="flex justify-center p-6 md:p-12 md:pt-0">
                    <button className="max-w-[285px] w-full h-14 rounded-lg bg-primary/90 text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%]">
                        重新發佈
                    </button>
                </section>
            </Dialog>
        </div>
    )
}
