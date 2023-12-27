import { Vote } from '../types'
import { VoteAction } from '../types/VoteAction'

const checkVoteIsMine = (votes: Vote[], userState: any) => {
    let finalAction = null
    let isMine = false
    if (!userState) throw new Error('User state not initialized')
    for (const vote of votes) {
        let userEpochKeys = userState.getEpochKeys(vote.epoch)
        if (!Array.isArray(userEpochKeys)) {
            userEpochKeys = [userEpochKeys]
        }

        const userEpochKeyStrings = userEpochKeys.map(
            (ek: { toString: () => any }) => ek.toString(),
        )
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
