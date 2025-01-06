import CommentImg from '@/assets/img/comment.png'
import { PATHS } from '@/constants/paths'
import { useAuthStatus } from '@/features/auth'
import { useReputationScore } from '@/features/reporting'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { useMatch, useNavigate } from 'react-router-dom'
import { useToggle } from 'react-use'
import { usePostById } from '../../hooks/usePostById/usePostById'
import CreateComment from '../CreateComment/CreateComment'

export function LeaveComment({
    postId,
    isInitiallyOpenComment = false,
}: {
    postId: string
    isInitiallyOpenComment?: boolean
}) {
    const isPostPage = useMatch(PATHS.VIEW_POST)

    const navigate = useNavigate()

    const { isLoggedIn } = useAuthStatus()

    const { isValidReputationScore } = useReputationScore()

    const { data: post } = usePostById(postId)

    const [isOpenComment, toggleIsOpenComment] = useToggle(
        isInitiallyOpenComment,
    )

    const onComment = () => {
        if (!postId) return

        if (isPostPage) {
            if (!isValidReputationScore) {
                openForbidActionDialog()
                return
            }
            toggleIsOpenComment()
        } else {
            navigate(`/posts/${postId}/?leaveComment=1`)
        }
    }

    const onCancelComment = () => {
        toggleIsOpenComment(false)
    }

    return (
        <>
            <CommentButton
                count={post?.commentCount ?? 0}
                disabled={!isLoggedIn}
                onClick={onComment}
            />
            <CreateComment
                postId={postId}
                isOpen={isOpenComment}
                onClose={onCancelComment}
            />
        </>
    )
}

function CommentButton({
    count = 0,
    disabled = false,
    onClick = () => {},
}: {
    count?: number
    disabled?: boolean
    onClick?: () => void
}) {
    return (
        <button
            className="flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            disabled={disabled}
            onClick={(event) => {
                event.preventDefault()
                onClick()
            }}
        >
            <img className="w-5 h-5" src={CommentImg} alt="comment" />
            <span className="text-xs font-medium tracking-wide text-black/80 min-w-4">
                {count}
            </span>
        </button>
    )
}
