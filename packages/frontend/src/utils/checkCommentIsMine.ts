import { UserState } from '@/contexts/Userstate'
import { RelayRawComment } from '@/types/api'

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
