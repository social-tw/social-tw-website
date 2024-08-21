import { Prover } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import { toDecString } from '@unirep/core/src/Synchronizer'
import { DB, TransactionDB } from 'anondb'
import { ethers } from 'ethers'
import { ENV, REPORT_SETTLE_VOTE_THRESHOLD, RESET_DATABASE } from '../../config'
import schema from '../../db/schema'
import {
    AdjudicateValue,
    Adjudicator,
    CommentStatus,
    ReportStatus,
    ReportType,
    UserRegisterStatus,
} from '../../types'
import { postService } from '../PostService'
import ActionCountManager from '../utils/ActionCountManager'
import { socketManager } from '../utils/SocketManager'

type EventHandlerArgs = {
    event: ethers.Event
    decodedData: { [key: string]: any }
    db: TransactionDB
}

let tempUnirepSocialContract: ethers.Contract

export class UnirepSocialSynchronizer extends Synchronizer {
    unirepSocialContract: ethers.Contract
    prover: Prover

    constructor(
        config: {
            db: DB
            attesterId: bigint | bigint[]
            prover: Prover
            provider: ethers.providers.Provider
            unirepAddress: string
            genesisBlock?: number
        },
        unirepSocialContract: ethers.Contract
    ) {
        tempUnirepSocialContract = unirepSocialContract
        super(config)
        this.prover = config.prover
        this.unirepSocialContract = unirepSocialContract
    }

    get contracts() {
        return {
            ...super.contracts,
            [tempUnirepSocialContract.address]: {
                contract: tempUnirepSocialContract,
                eventNames: ['Post', 'UserSignUp', 'Comment', 'UpdatedComment'],
            },
        }
    }

    async resetDatabase() {
        if (RESET_DATABASE != 'true' || ENV == 'prod') return
        console.log('start reset all data in postgres')
        schema.map((obj) => {
            this.db.delete(obj.name, { where: {} })
        })
    }

    // If server restarts, synchronizer will fetch all events from the smart contract.
    // However, action counts are only valid on the current epoch, so synchronizer
    // only updates action count if the epoch is the same with smart contract
    async updateActionCount(db: DB, epochKey: string, epoch: number) {
        const currentEpoch = this.calcCurrentEpoch()
        if (currentEpoch == epoch) {
            ActionCountManager.addActionCount(db, epochKey, epoch, 1)
        }
    }

    // After the user is on-chain, update the signup status
    async handleUserSignUp({ event, db, decodedData }: EventHandlerArgs) {
        const hashUserId = ethers.utils.hexStripZeros(event.topics[1])
        const fromServer = ethers.utils.defaultAbiCoder.decode(
            ['bool'],
            event.topics[2]
        )[0]
        const status = fromServer
            ? UserRegisterStatus.REGISTERER_SERVER
            : UserRegisterStatus.REGISTERER

        db.upsert('SignUp', {
            where: { hashUserId },
            update: { status },
            create: { hashUserId, status },
        })
    }

    // After the post is on-chain, update the post id and status
    async handlePost({ event, db, decodedData }: EventHandlerArgs) {
        const transactionHash = event.transactionHash
        const epochKey = toDecString(event.topics[1])
        const postId = toDecString(event.topics[2])
        const epoch = Number(decodedData.epoch)

        db.update('Post', {
            where: { transactionHash },
            update: {
                postId,
                status: 1,
            },
        })

        await this.updateActionCount(this.db, epochKey, epoch)

        return true
    }

    async handleComment({ event, db, decodedData }: EventHandlerArgs) {
        const transactionHash = event.transactionHash
        const epochKey = toDecString(event.topics[1])
        const postId = toDecString(event.topics[2])
        const commentId = toDecString(event.topics[3])
        const epoch = Number(decodedData.epoch)
        const content = decodedData.content

        // We need to verify if we have already add commentCount to the post
        const existingComment = await this.db.findOne('Comment', {
            where: {
                transactionHash,
            },
        })

        // If comment not exist and check content is empty or not
        //     if empty : insert comment with status = 2 (deleted)
        //     if not empty : insert comment with status = 1 (success)
        // If comment exist with status 2(deleted), update comment id only
        // if comment exist with status 0(init), update comment id and status = 1 (success)
        const updateStatus = existingComment
            ? existingComment.status == 2
                ? 2
                : 1
            : content
            ? 1
            : 2

        // Use upsert to either create a new comment or update an existing one
        db.upsert('Comment', {
            where: { transactionHash },
            create: {
                commentId,
                postId,
                transactionHash,
                content,
                epoch,
                epochKey,
                status: updateStatus,
            },
            update: {
                commentId,
                status: updateStatus,
            },
        })

        const commentCount = await this.db.count('Comment', {
            AND: [{ postId }, { status: 1 }],
        })

        db.update('Post', {
            where: { postId },
            update: {
                commentCount: commentCount + 1,
            },
        })

        await this.updateActionCount(this.db, epochKey, epoch)

        socketManager.emitComment({
            id: commentId,
            postId: postId,
            content: content,
            epochKey: epochKey,
            epoch: epoch,
        })

        return true
    }

    // for now updated comment only for delete comment use,
    // after updated comment on-chain, update the comment status
    // and update the comment count of post
    async handleUpdatedComment({ event, db, decodedData }: EventHandlerArgs) {
        const epochKey = toDecString(event.topics[1])
        const postId = toDecString(event.topics[2])
        const commentId = toDecString(event.topics[3])
        const epoch = Number(decodedData.epoch)
        const newContent = decodedData.newContent

        db.update('Comment', {
            where: {
                AND: [{ postId: postId }, { commentId: commentId }],
            },
            update: {
                content: newContent,
                status: CommentStatus.DELETED,
            },
        })

        // update comment count into post table
        const commentCount = await this.db.count('Comment', {
            AND: [{ postId: postId }, { status: 1 }],
        })

        db.update('Post', {
            where: { postId },
            update: {
                commentCount: commentCount - 1,
            },
        })

        await this.updateActionCount(this.db, epochKey, epoch)

        return true
    }

    // overwrite handleEpochEnded to delete all epochKeyAction when the epoch ended
    async handleEpochEnded({
        event,
        db,
        decodedData,
    }: EventHandlerArgs): Promise<true | undefined> {
        const result = await super.handleEpochEnded({ event, db, decodedData })
        if (!result) return
        const epoch = Number(decodedData.epoch)

        const rows = await this.db.count('EpochKeyAction', {
            epoch: epoch,
        })

        // make sure all data whose epochs are before the current ended one is deleted as well
        if (rows) {
            db.delete('EpochKeyAction', {
                where: {
                    epoch: { lte: epoch },
                },
            })
        }

        // Settle reports
        const votingReports = await this.db.findMany('ReportHistory', {
            where: {
                status: ReportStatus.VOTING,
            },
        })
        // Go through all the voting reports
        for (const report of votingReports) {
            const adjudicators = report.adjudicatorsNullifier || []
            const agreeVotes = adjudicators.filter(
                (adj: Adjudicator) =>
                    adj.adjudicateValue === AdjudicateValue.AGREE
            ).length
            const disagreeVotes = adjudicators.filter(
                (adj: Adjudicator) =>
                    adj.adjudicateValue === AdjudicateValue.DISAGREE
            ).length
            // If the current epoch > reportEpoch AND sum of votes > threshold AND vote value > 0
            if (
                epoch >= report.reportEpoch &&
                report.adjudicateCount >= REPORT_SETTLE_VOTE_THRESHOLD &&
                agreeVotes !== disagreeVotes
            ) {
                // Then update the status of the report to WaitingForTx
                db.update('ReportHistory', {
                    where: { reportId: report.reportId },
                    update: {
                        status: ReportStatus.WAITING_FOR_TRANSACTION,
                    },
                })
                // Then update the status of the post or comment to Onchain or Disagreed
                // 1: ON_CHAIN, 3: DISAGREED
                const newStatus = agreeVotes > disagreeVotes ? 1 : 3
                const tableName =
                    report.type == ReportType.POST ? 'Post' : 'Comment'
                db.update(tableName, {
                    where: {
                        [`${tableName.toLowerCase()}Id`]: report.objectId,
                    },
                    update: { status: newStatus },
                })
            }
        }

        // update post order
        await postService.updateOrder(this.db)

        return result
    }
}
