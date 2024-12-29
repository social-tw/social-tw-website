import { DB } from 'anondb'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { Errors, Vote, VoteAction } from '../types'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ActionCountManager from './utils/ActionCountManager'
import ProofHelper from './utils/ProofHelper'
import { socketManager } from './utils/SocketManager'

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

    async getVoteHistory(
        fromEpoch: number,
        toEpoch: number,
        db: DB
    ): Promise<Vote[]> {
        if (fromEpoch > toEpoch || fromEpoch < 0 || toEpoch < 0)
            throw Errors.INVALID_EPOCH_RANGE()
        const votes = await db.findMany('Vote', {
            where: {
                epoch: { gte: fromEpoch, lte: toEpoch },
            },
            orderBy: {
                epoch: 'asc',
            },
        })
        if (votes.length === 0) throw Errors.NO_VOTE_HISTORY_FOUND()

        return votes
    }

    // TODO: should check if user voted to the same post before with other epochKey
    /**
     * The user can vote or cancel the vote to the post even in the different epoch,
     * but the user is only allowed to vote either upvote or downvote, not both.
     *
     * @param postId
     * @param voteAction
     * @param publicSignals
     * @param proof
     * @param enableEpochValidation
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
        console.log("====================== Voting ======================");
        const votingStart = new Date().getTime();


        // get valid epoch key
        
        const genEpokProofStart = new Date().getTime()
        const epochKeyProof = await ProofHelper.getAndVerifyEpochKeyLiteProof(
            publicSignals,
            proof,
            synchronizer
        )

        // find post which is voted
        const post = await db.findOne('Post', {
            where: {
                postId: postId,
            },
        })
        if (!post) throw Errors.POST_NOT_EXIST()

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
            post,
            voteAction
        )

        const votingEnd = new Date().getTime();
        console.log("Voting Cost: ", votingEnd - votingStart, "ms");
        
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
        throw Errors.INVALID_VOTE_ACTION()
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

        let actionCount: number
        if (createVote) {
            await db.create('Vote', voteCreateStatement)
            actionCount = 1
        } else {
            await db.delete('Vote', voteDeleteStatement)
            // epk cancel the action, decrease 1 count
            actionCount = -1
        }
        await db.update('Post', postStatement)

        socketManager.emitVote({
            postId: postId,
            epoch: epoch,
            vote: voteAction,
        })

        await ActionCountManager.addActionCount(
            db,
            epochKey,
            epoch,
            actionCount
        )
    }
}

export const voteService = new VoteService()
