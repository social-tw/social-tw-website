import { DB } from 'anondb'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import { VoteAction } from '../types'
import ActionCountManager from './singletons/ActionCountManager'
import { socketManager } from './singletons/SocketManager'
import { PublicSignals, Groth16Proof } from 'snarkjs'
import ProofHelper from './singletons/ProofHelper'
import {
    InvalidPostIdError,
    InvalidVoteActionError,
} from '../types/InternalError'

export class VoteService {
    async fetchMyAccountVotes(
        epks: string[],
        sortKey: 'publishedAt' | 'voteSum',
        direction: 'asc' | 'desc',
        db: DB
    ): Promise<any[]> {
        return db.findMany('Vote', {
            where: {
                epochKey: epks,
            },
            orderBy: {
                [sortKey]: direction,
            },
            include: {
                post: true,
            },
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
    async vote(
        postId: string,
        voteAction: VoteAction,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        db: DB,
        synchronizer: UnirepSocialSynchronizer
    ) {
        // get valid epoch key
        const epochKeyProof = await ProofHelper.getAndVerifyEpochKeyProof(
            publicSignals,
            proof,
            synchronizer
        )

        // find post which is voted
        const findPost = await db.findOne('Post', {
            where: {
                postId: postId,
            },
        })
        if (!findPost) {
            throw InvalidPostIdError
        }

        const epochKey = epochKeyProof.epochKey.toString()
        const findVote = await db.findOne('Vote', {
            where: {
                postId: postId,
                epochKey: epochKey,
            },
        })

        this.verifyVoteAction(voteAction, findVote)

        await this.executeTx(
            db,
            epochKey,
            Number(epochKeyProof.epoch),
            findPost,
            voteAction
        )
    }

    /**
     * we should verify the action before we execute the transaction
     *
     * @param voteAction the action that the user is about to do
     * @param findVote the vote data, if it's undefined then it's the first time to vote
     * @returns if the vote action is valid
     * @throws InvalidVoteActionError otherwise
     */

    verifyVoteAction(voteAction: VoteAction, findVote: any) {
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
    async executeTx(
        db: DB,
        epochKey: string,
        epoch: number,
        post: any,
        voteAction: VoteAction
    ): Promise<void> {
        const postId = post.postId
        let createVote = true

        const voteCreateStatement = {
            postId: postId,
            epochKey: epochKey,
            epoch: epoch,
            upVote: false,
            downVote: false,
        }

        const voteDeleteStatement = {
            where: {
                postId: postId,
                epochKey: epochKey,
            },
        }

        // only modify the upCount and downCount
        const postStatement = {
            where: {
                postId: postId,
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

        await ActionCountManager.addActionCount(db, epochKey, epoch, (txDB) => {
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

            socketManager.emitVote({
                postId: postId,
                epoch: epoch,
                vote: voteAction,
            })

            return actionCount
        })
    }
}

export const voteService = new VoteService()
