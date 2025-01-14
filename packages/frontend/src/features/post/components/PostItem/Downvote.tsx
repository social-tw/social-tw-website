import DownVoteLgImg from '@/assets/img/downvote-lg.png'
import DownVoteImg from '@/assets/img/downvote.png'
import { useAuthStatus } from '@/features/auth'
import { useUserState } from '@/features/core'
import { VoteAction } from '@/types/Vote'
import { getEpochKeyNonce, isMyEpochKey } from '@/utils/helpers/epochKey'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useMeasure, useToggle } from 'react-use'
import { usePostById } from '../../hooks/usePostById/usePostById'
import { useVotes } from '../../hooks/useVotes/useVotes'
import VoteFailureDialog from './VoteFailureDialog'

export function Downvote({ postId }: { postId: string }) {
    const { userState } = useUserState()

    const { isLoggedIn } = useAuthStatus()

    const { data: post } = usePostById(postId)

    const myVote = useMemo(() => {
        const votes = post?.votes
        if (!userState || !votes) return null
        for (const vote of votes) {
            if (isMyEpochKey(userState, vote.epoch, vote.epochKey)) {
                return vote
            }
        }
        return null
    }, [userState, post])

    const isActive = !!myVote?.downVote

    const { isPending, isError, reset, mutate: createVote } = useVotes()

    const [isVoting, toggleIsVoting] = useToggle(false)

    const onDownvote = () => {
        if (!userState || !postId) return

        if (myVote?.upVote) {
            const nonce = getEpochKeyNonce(
                userState,
                myVote.epoch,
                myVote.epochKey,
            )
            createVote({
                id: postId,
                voteAction: VoteAction.CANCEL_UPVOTE,
                votedNonce: nonce,
                votedEpoch: myVote?.epoch,
            })
        }
        if (myVote?.downVote) {
            const nonce = getEpochKeyNonce(
                userState,
                myVote.epoch,
                myVote.epochKey,
            )
            createVote({
                id: postId,
                voteAction: VoteAction.CANCEL_DOWNVOTE,
                votedNonce: nonce,
                votedEpoch: myVote?.epoch,
            })
        } else {
            toggleIsVoting(true)
            createVote({
                id: postId,
                voteAction: VoteAction.DOWNVOTE,
                votedNonce: null,
                votedEpoch: null,
            })
        }
    }

    const onAnimationComplete = () => {
        toggleIsVoting(false)
    }

    return (
        <>
            <DownvoteButton
                count={post?.downCount ?? 0}
                isActive={isActive}
                isPending={isPending}
                disabled={!isLoggedIn}
                onClick={onDownvote}
            />
            <DownvoteAnimation on={isVoting} onComplete={onAnimationComplete} />
            <VoteFailureDialog isOpen={!!isError} onClose={reset} />
        </>
    )
}

function DownvoteButton({
    count = 0,
    isPending = false,
    isActive = false,
    disabled = false,
    onClick = () => {},
}: {
    count?: number
    isPending?: boolean
    isActive?: boolean
    disabled?: boolean
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            className="inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            disabled={disabled}
            onClick={(event) => {
                event.preventDefault()
                onClick()
            }}
        >
            <span className="relative flex items-center justify-center overflow-hidden w-7 h-7">
                <span
                    className={clsx(
                        'absolute top-0 left-0 w-full h-full border-4 rounded-full',
                        isPending &&
                            'border-white/50 border-s-black/30 animate-spin',
                        isActive && 'border-white',
                    )}
                />
                <img className="w-5 h-5" src={DownVoteImg} alt="Downvote" />
            </span>
            <span className="text-xs font-medium tracking-wide text-black/80 min-w-4">
                {count}
            </span>
        </button>
    )
}

function DownvoteAnimation({
    on = false,
    onComplete = () => {},
}: {
    on?: boolean
    onComplete?: () => void
}) {
    const [ref, { width }] = useMeasure<HTMLDivElement>()

    const startX = -width / 2 - 4
    const endX = width / 2 + 4

    if (!on) return null

    return (
        <div
            ref={ref}
            className="absolute top-0 left-0 flex items-center justify-center w-full h-full"
        >
            <motion.div
                className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/90"
                animate={{
                    x: [startX, 0, endX],
                    scale: [1, 4, 4],
                    opacity: [1, 1, 0.4],
                }}
                transition={{
                    duration: 1,
                    ease: 'easeInOut',
                    times: [0, 0.5, 1],
                }}
                onAnimationComplete={onComplete}
            >
                <img
                    className="w-5 h-5"
                    src={DownVoteLgImg}
                    alt="Downvote large"
                />
            </motion.div>
        </div>
    )
}
