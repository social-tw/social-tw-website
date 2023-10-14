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
}

/**
 * we should verify the action before we execute the transaction
 *
 * @param voteAction the action that the user is about to do
 * @param findVote the vote data, if it's undefined then it's the first time to vote
 * @returns bool whether the vote action is valid or not
 */
function verifyVoteAction(voteAction: VoteAction, findVote: any): boolean {
    let result = false
    switch (voteAction) {
        case VoteAction.UPVOTE, VoteAction.DOWNVOTE:
            // this epk hasn't voted
            result = !findVote
            break;
        case VoteAction.CANCEL_UPVOTE:
            // this epk voted for upVote
            result = findVote && findVote.upVote
            break;
        case VoteAction.CANCEL_DOWNVOTE:
            // this epk voted for downVote
            result = findVote && findVote.downVote
            break;
        default:
            break;
    }
    return result
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
// TODO: need to increase / decrease the epochKey counter times
async function exeuteTxs(
    db: DB,
    epochKey: string,
    post: any,
    voteAction: VoteAction
): Promise<void> {
    const _id = post._id
    let createVote = true

    const voteCreateStatement = {
        create: {
            postId: _id,
            epochKey: epochKey,
            upVote: false,
            downVote: false,
        }
    }

    const voteDeleteStatement = {
        where: {
            postId: _id,
            epochKey: epochKey
        }
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
            voteCreateStatement.create.upVote = true
            postStatement.update.upCount += 1
            break
        case VoteAction.DOWNVOTE:
            voteCreateStatement.create.downVote = true
            postStatement.update.downCount += 1
            break
        case VoteAction.CANCEL_UPVOTE:
            postStatement.update.upCount -= 1
            createVote = false
            break
        case VoteAction.CANCEL_DOWNVOTE:
            postStatement.update.downCount -= 1
            createVote = false
            break
        default:
            break
    }

    await db
        .transaction((txDB) => {
            if (createVote) {
                txDB.create('Vote', voteCreateStatement)
            } else {
                txDB.delete('Vote', voteDeleteStatement)
            }
            txDB.update('Post', postStatement)
        })
        .catch(() => console.log('Vote tx reverted'))
}

// TODO: should check if user voted to the same post before with other epochKey
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
async function Vote(req, res, db: DB, synchronizer: UnirepSocialSynchronizer) {
    try {
        //vote for post with _id
        const { _id, voteAction, publicSignals, proof } = req.body

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
            return
        }

        const epochKey = epochKeyProof.epochKey.toString()

        const findVote = await db.findOne('Vote', {
            where: {
                postId: _id,
                epochKey: epochKey,
            },
        })

        const isValidAction = verifyVoteAction(voteAction, findVote)
        if (!isValidAction) {
            res.status(400).json({error: 'Invalid vote action'})
        }

        await exeuteTxs(db, epochKey, findPost, voteAction)

        res.status(201)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error })
    }
}
