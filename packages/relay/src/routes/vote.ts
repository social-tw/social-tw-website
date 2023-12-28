import { DB } from 'anondb/node'
import { Express } from 'express'
import { EpochKeyProof } from '@unirep/circuits'
import { errorHandler, voteErrorHandler } from '../middleware'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { VoteAction } from '../types'
import {
    InvalidEpochError,
    InvalidAttesterIdError,
    InvalidProofError,
    InvalidPostIdError,
    InvalidVoteActionError,
} from '../error/voteError'
import { addActionCount } from '../utils/TransactionHelper'
import { socketManager } from '../singletons/SocketManager'

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
 * we should validate the epoch before we execute the transaction
 *
 * @param epoch the epoch to be validated
 * @param expectedEpoch the epoch for validation
 * @throws InvalidEpochError if the epoch is invalid
 */

function validateEpoch(epoch: any, expectedEpoch: any) {
    if (epoch.toString() === expectedEpoch.toString()) {
        return
    }
    throw InvalidEpochError
}

/**
 * we should validate the attester id before we execute the transaction
 *
 * @param attesterId the attester id to be validated
 * @param expectedAttesterId the attester id for validation
 * @throws InvalidAttesterIdError if the attester id is invalid
 */

function validateAttesterId(attesterId: any, expectedAttesterId: any) {
    if (attesterId === expectedAttesterId) {
        return
    }
    throw InvalidAttesterIdError
}

/**
 * we should verify the epoch key proof before we execute the transaction
 *
 * @param epochKeyProof the epoch key proof that the user is about to vote
 * @throws InvalidProofError if the proof is invalid
 */

async function verifyEpochKeyProof(epochKeyProof: EpochKeyProof) {
    if (await epochKeyProof.verify()) {
        return
    }
    throw InvalidProofError
}

/**
 * we should verify the action before we execute the transaction
 *
 * @param voteAction the action that the user is about to do
 * @param findVote the vote data, if it's undefined then it's the first time to vote
 * @returns if the vote action is valid
 * @throws InvalidVoteActionError otherwise
 */

function verifyVoteAction(voteAction: VoteAction, findVote: any) {
    switch (voteAction) {
        case VoteAction.UPVOTE:
        case VoteAction.DOWNVOTE:
            // this epk hasn't voted
            if (findVote) {
                break
            }
            return
        case VoteAction.CANCEL_UPVOTE:
            // this epk voted for upVote
            if (!findVote || !findVote.upVote) {
                break
            }
            return
        case VoteAction.CANCEL_DOWNVOTE:
            // this epk voted for downVote
            if (!findVote || !findVote.downVote) {
                break
            }
            return
        default:
            return
    }
    throw InvalidVoteActionError
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
    epoch: number,
    post: any,
    voteAction: VoteAction
): Promise<void> {
    const _id = post._id
    let createVote = true

    const voteCreateStatement = {
        postId: _id,
        epochKey: epochKey,
        epoch: epoch,
        upVote: false,
        downVote: false,
    }

    const voteDeleteStatement = {
        where: {
            postId: _id,
            epochKey: epochKey,
        },
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
            voteCreateStatement.upVote = true
            postStatement.update.upCount += 1
            break
        case VoteAction.DOWNVOTE:
            voteCreateStatement.downVote = true
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

    await addActionCount(db, epochKey, epoch, (txDB) => {
        let actionCount
        if (createVote) {
            txDB.create('Vote', voteCreateStatement)
            actionCount = 1
        } else {
            txDB.delete('Vote', voteDeleteStatement)
            // epk cancel the action, decrease 1 count
            actionCount = -1
        }
        txDB.update('Post', postStatement)

        socketManager.emitVote({ postId: _id, epoch: epoch, vote: voteAction })

        return actionCount
    })
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

        validateEpoch(epochKeyProof.epoch, epoch)
        validateAttesterId(epochKeyProof.attesterId, synchronizer.attesterId)
        await verifyEpochKeyProof(epochKeyProof)

        // find post which is voted
        const findPost = await db.findOne('Post', {
            where: {
                _id: _id,
            },
        })
        if (!findPost) {
            throw InvalidPostIdError
        }

        const epochKey = epochKeyProof.epochKey.toString()

        const findVote = await db.findOne('Vote', {
            where: {
                postId: _id,
                epochKey: epochKey,
            },
        })

        verifyVoteAction(voteAction, findVote)

        await exeuteTxs(db, epochKey, epoch, findPost, voteAction)

        res.status(201).json({})
    } catch (error: any) {
        voteErrorHandler(error, res)
    }
}
