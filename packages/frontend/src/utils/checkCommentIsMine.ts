import { CommnetDataFromApi } from '@/types'
import { UserState } from '@unirep/core'

const checkCommentIsMine = (
    comment: CommnetDataFromApi,
    userState: UserState
) => {
    if (!userState.getEpochKeys(comment.epoch)) return false
    
    const epochKeys = userState.getEpochKeys(comment.epoch).toString()
    if (epochKeys.includes(comment.epochKey)) return true

    return false
}

export default checkCommentIsMine
