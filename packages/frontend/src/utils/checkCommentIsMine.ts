import { UserState } from '@/contexts/UserState'
import { RelayRawComment } from '@/types/Comments'

const checkCommentIsMine = (
    comment: Pick<RelayRawComment, 'epoch' | 'epochKey'>,
    userState: UserState,
) => {
    if (!userState.getEpochKeys(comment.epoch)) return false

    const epochKeys = userState.getEpochKeys(comment.epoch).toString()
    if (epochKeys.includes(comment.epochKey)) return true

    return false
}

export default checkCommentIsMine
