import { Vote } from '../types'
import { UserState } from '@unirep/core'
import { VoteAction } from '../types/VoteAction'

const checkVoteIsMine = (votes: Vote[], userState: UserState) => {
    let finalAction = null
    let isMine = false

    for (const vote of votes) {
        let userEpochKeys = userState.getEpochKeys(vote.epoch)
        if (!Array.isArray(userEpochKeys)) {
            userEpochKeys = [userEpochKeys]
        }

        const userEpochKeyStrings = userEpochKeys.map((ek) => ek.toString())

        if (userEpochKeyStrings.includes(vote.epochKey.toString())) {
            isMine = true
            if (vote.upVote) {
                finalAction = VoteAction.UPVOTE
            } else if (vote.downVote) {
                finalAction = VoteAction.DOWNVOTE
            }
        }
    }

    return { isMine, finalAction }
}

export default checkVoteIsMine
