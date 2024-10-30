import CommentImg from '@/assets/img/comment.png'
import DownVoteImg from '@/assets/img/downvote.png'
import ShareImg from '@/assets/img/share.png'
import UpVoteImg from '@/assets/img/upvote.png'
import { VoteAction } from '@/types/Vote'

interface PostFooterProps {
    isLoggedIn: boolean
    isMineState: boolean
    countUpVote: number
    countDownVote: number
    countComment: number
    voteAction: VoteAction | null
    handleVote: (voteType: VoteAction) => void
    handleComment: () => void
    handleShare: () => void
}

function PostFooter({
    isLoggedIn,
    isMineState,
    countUpVote,
    countDownVote,
    countComment,
    voteAction,
    handleVote,
    handleComment,
    handleShare,
}: PostFooterProps) {
    return (
        <footer className="flex items-center gap-4">
            <UpVoteBtn
                isLoggedIn={isLoggedIn}
                isMineState={isMineState}
                voteAction={voteAction}
                count={countUpVote}
                handleVote={handleVote}
            />
            <DownVoteBtn
                isLoggedIn={isLoggedIn}
                isMineState={isMineState}
                voteAction={voteAction}
                count={countDownVote}
                handleVote={handleVote}
            />
            <CommentBtn
                isLoggedIn={isLoggedIn}
                count={countComment}
                onClick={handleComment}
            />
            <ShareBtn onClick={handleShare} isLoggedIn={isLoggedIn} />
        </footer>
    )
}

interface CommentBtnProps {
    isLoggedIn: boolean
    count: number
    onClick: () => void
}
function CommentBtn({ isLoggedIn, count, onClick }: CommentBtnProps) {
    const cursor = isLoggedIn ? 'pointer' : 'not-allowed'
    return (
        <button
            className="flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            onClick={onClick}
        >
            <img
                className="w-5 h-5"
                src={CommentImg}
                alt="comment"
                style={{ cursor }}
            />
            <span className="text-xs font-medium tracking-wide text-black/80">
                {count}
            </span>
        </button>
    )
}

interface VoteBtnProps {
    isLoggedIn: boolean
    isMineState: boolean
    isActive: boolean
    iconSrc: string
    iconAlt: string
    count: number
    onClick: () => void
}
function VoteBtn({
    isLoggedIn,
    isMineState,
    isActive,
    iconSrc,
    iconAlt,
    count,
    onClick,
}: VoteBtnProps) {
    const cursor = isLoggedIn ? 'pointer' : 'not-allowed'
    const imgWrapperClasses =
        isMineState && isActive ? 'border-4 border-white rounded-full' : ''
    return (
        <div
            className={`flex items-center gap-1`}
            onClick={onClick}
            style={{ cursor }}
        >
            <div className={`${imgWrapperClasses}`}>
                <img className="w-5 h-5" src={iconSrc} alt={iconAlt} />
            </div>
            <span className="text-xs font-medium tracking-wide text-black/80">
                {count}
            </span>
        </div>
    )
}

interface DownVoteBtnProps {
    isLoggedIn: boolean
    isMineState: boolean
    count: number
    voteAction: VoteAction | null
    handleVote: (voteType: VoteAction) => void
}
function DownVoteBtn({
    isLoggedIn,
    isMineState,
    count,
    voteAction,
    handleVote,
}: DownVoteBtnProps) {
    const isActive = voteAction === VoteAction.DOWNVOTE
    const onClick = () => {
        handleVote(VoteAction.DOWNVOTE)
    }
    return (
        <VoteBtn
            isLoggedIn={isLoggedIn}
            isMineState={isMineState}
            isActive={isActive}
            iconSrc={DownVoteImg}
            iconAlt="DownVote"
            count={count}
            onClick={onClick}
        />
    )
}

interface UpVoteBtnProps {
    isLoggedIn: boolean
    isMineState: boolean
    count: number
    voteAction: VoteAction | null
    handleVote: (voteType: VoteAction) => void
}
function UpVoteBtn({
    isLoggedIn,
    isMineState,
    count,
    voteAction,
    handleVote,
}: UpVoteBtnProps) {
    const isActive = voteAction === VoteAction.UPVOTE
    const onClick = () => {
        handleVote(VoteAction.UPVOTE)
    }
    return (
        <VoteBtn
            isLoggedIn={isLoggedIn}
            isMineState={isMineState}
            isActive={isActive}
            iconSrc={UpVoteImg}
            iconAlt="UpVote"
            count={count}
            onClick={onClick}
        />
    )
}

interface ShareBtnProps {
    onClick: () => void
    isLoggedIn: boolean
}
function ShareBtn({ onClick, isLoggedIn }: ShareBtnProps) {
    const cursor = isLoggedIn ? 'pointer' : 'not-allowed'

    return (
        <>
            <button
                className="flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                onClick={onClick}
            >
                <img
                    className="w-5 h-5"
                    src={ShareImg}
                    alt="share"
                    style={{ cursor }}
                />
            </button>
        </>
    )
}

export default PostFooter
