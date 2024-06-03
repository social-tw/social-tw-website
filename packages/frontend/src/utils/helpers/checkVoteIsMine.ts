import { RelayRawVote, VoteAction } from '@/types/Vote'

const checkVoteIsMine = (votes: RelayRawVote[], userState: any) => {
    let finalAction = null
    let isMine = false
    let votedNonce = null
    let votedEpoch = null
    if (!userState) throw new Error('User state not initialized')
    for (const vote of votes) {
        let userEpochKeys = userState.getEpochKeys(vote.epoch)
        if (!Array.isArray(userEpochKeys)) {
            userEpochKeys = [userEpochKeys]
        }

        const userEpochKeyStrings = userEpochKeys.map(
            (ek: { toString: () => any }) => ek.toString(),
        )
        for (let i = 0; i < userEpochKeyStrings.length; i++) {
            if (userEpochKeyStrings[i] === vote.epochKey.toString()) {
                isMine = true
                votedNonce = i
                votedEpoch = vote.epoch
                if (vote.upVote) {
                    finalAction = VoteAction.UPVOTE
                } else if (vote.downVote) {
                    finalAction = VoteAction.DOWNVOTE
                }
                break
            }
        }
    }
    return { isMine, finalAction, votedNonce, votedEpoch }
}

export default checkVoteIsMine
