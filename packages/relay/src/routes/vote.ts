import { DB } from 'anondb/node'
import { Express } from 'express'
import { EpochKeyProof } from '@unirep/circuits'
import { errorHandler } from '../middleware'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { VoteAction } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/vote',
        errorHandler(async (req, res, next) => {
            await Vote(req, res, db, synchronizer)
        })
    )

    // TODO: add get api to fetch all votes of post Id for frontend to check if user voted or not
}

/**
 * Use this function to help us find out which vote action the user
 * is going to do
 *
 * @param vote true for upvote action, false for downvote action
 * @param findVote the vote data, if it's undefined then it's the first time to vote
 * @returns voteAction or error if it's wrong action
 */
function selectVoteAction(vote: boolean, findVote: any): VoteAction | Error {
    let voteAction: VoteAction
    if (findVote) {
        if (vote && findVote.upVote) {
            voteAction = VoteAction.CANCEL_UPVOTE
        } else if (!vote && findVote.downVote) {
            voteAction = VoteAction.CANCEL_DOWNVOTE
        } else {
            return new Error('wrong vote action')
        }
    } else {
        if (vote) {
            voteAction = VoteAction.UPVOTE
        } else {
            voteAction = VoteAction.DOWNVOTE
        }
    }
    return voteAction
}

/**
 * Since the action of the vote will effect the post as well,
 * we should use transactionDB to execute these two transactions at once
 * to make sure the integrity
 *
 * @param db SQLiteConnector
 * @param epochKeyProof construct epochKeyProof from zkp
 * @param post the post that the user is about to vote
 * @param voteAction the vote action of the user
 */
async function exeuteTxs(
    db: DB,
    epochKey: string,
    post: any,
    voteAction: VoteAction
): Promise<void> {
    const _id = post._id

    // using upsert, so left update blank for update statement
    const voteStatement = {
        where: {
            postId: _id,
            epochKey: epochKey,
        },
        create: {
            postId: _id,
            epochKey: epochKey,
            upVote: false,
            downVote: false,
        },
        update: {},
    }

    // only modify the upCount and downCount
    const postStatement = {
        where: {
            _id: _id,
        },
        update: {
            upCount: post.upCount,
            downCount: post.downCount,
        },
    }
    switch (voteAction) {
        case VoteAction.UPVOTE:
            voteStatement.create.upVote = true
            postStatement.update.upCount += 1
            break
        case VoteAction.DOWNVOTE:
            voteStatement.create.downVote = true
            postStatement.update.downCount += 1
            break
        case VoteAction.CANCEL_UPVOTE:
            voteStatement.update = { upVote: false }
            postStatement.update.upCount -= 1
            break
        case VoteAction.CANCEL_DOWNVOTE:
            voteStatement.update = { downVote: false }
            postStatement.update.downCount -= 1
            break
        default:
            break
    }

    await db
        .transaction((txDB) => {
            txDB.upsert('Vote', voteStatement)
            txDB.update('Post', postStatement)
        })
        .catch(() => console.log('Vote tx reverted'))
}

/**
 * The user can vote or cancel the vote to the post even in the different epoch,
 * but the user is only allowed to vote either upvote or downvote, not both.
 *
 * @param req express request, the body should contain postId, voteAction(refer to types/VoteAction.ts) and zkp
 * @param res express response
 * @param db SQLiteConnector
 * @param synchronizer UnirepSocialSynchronizer
 * @returns
 */
// TODO: need to increment the epochKey counter
async function Vote(req, res, db: DB, synchronizer: UnirepSocialSynchronizer) {
    try {
        //vote for post with _id
        const { _id, vote, publicSignals, proof } = req.body

        // user is able to restore the epochKey from the vote data
        const epochKeyProof = new EpochKeyProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        // get current epoch and unirep contract
        const epoch = await synchronizer.loadCurrentEpoch()

        // check if epoch is valid
        const isEpochvalid = epochKeyProof.epoch.toString() === epoch.toString()
        if (!isEpochvalid) {
            res.status(400).json({ error: 'Invalid Epoch' })
            return
        }
        
        // check attesterId
        if (epochKeyProof.attesterId != synchronizer.attesterId) {
            res.status(400).json({ error: 'Wrong attesterId' })
            return
        }

        // verify epochKeyProof of user
        const valid = await epochKeyProof.verify()
        if (!valid) {
            res.status(400).json({ error: 'Invalid proof' })
            return
        }

        // find post which is voted
        const findPost = await db.findOne('Post', {
            where: {
                _id: _id,
            },
        })

        if (!findPost) {
            res.status(400).json({ error: 'Invalid postId' })
        }

        const epochKey = epochKeyProof.epochKey.toString()

        const findVote = await db.findOne('Vote', {
            where: {
                postId: _id,
                epochKey: epochKey,
            },
        })

        const voteAction = selectVoteAction(vote, findVote)

        if (voteAction instanceof Error) {
            res.status(400).json(voteAction as Error)
            return
        }

        await exeuteTxs(db, epochKey, findPost, voteAction as VoteAction)

        res.status(201)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error })
    }
}
