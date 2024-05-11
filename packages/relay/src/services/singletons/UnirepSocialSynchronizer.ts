import { DB, TransactionDB } from 'anondb'
import { ethers } from 'ethers'
import { Prover } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import schema from '../../db/schema'
import { ENV, RESET_DATABASE } from '../../config'
import { toDecString } from '@unirep/core/src/Synchronizer'
import { socketManager } from './SocketManager'
import ActionCountManager from './ActionCountManager'
import { UserRegisterStatus } from '../../types'

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

    // if server restarts, synchronizer will fetch all events from smart contract,
    // however, action counts are only valid on the current epoch, so synchronizer
    // only updates action count if the epoch is the same with smart contract
    async updateActionCount(epochKey: string, epoch: number) {
        const currentEpoch = this.calcCurrentEpoch()
        if (currentEpoch == epoch) {
            // update action counter
            await ActionCountManager.addActionCount(this.db, epochKey, epoch, (_) => {
                return 1
            })
        } 
    }

    // once user signup, save the hash user id into db
    async handleUserSignUp({ event, db, decodedData }: EventHandlerArgs) {
        const hashUserId = ethers.utils.hexStripZeros(event.topics[1])
        const fromServer = ethers.utils.defaultAbiCoder.decode(
            ['bool'],
            event.topics[2]
        )[0]
        const status = fromServer
            ? UserRegisterStatus.REGISTERER_SERVER
            : UserRegisterStatus.REGISTERER

        db.update('SignUp', {
            where: { hashUserId },
            update: { status },
        })
    }

    async handlePost({ event, db, decodedData }: EventHandlerArgs) {
        const transactionHash = event.transactionHash
        const epochKey = toDecString(event.topics[1])
        const postId = toDecString(event.topics[2])
        const epoch = Number(decodedData.epoch)

        db.update('Post', {
            where: { transactionHash },
            update: {
                postId,
            },
        })

        await this.updateActionCount(epochKey, epoch)

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

        await this.updateActionCount(epochKey, epoch)

        socketManager.emitComment({
            id: commentId,
            postId: postId,
            content: content,
            epochKey: epochKey,
            epoch: epoch,
        })

        return true
    }

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
                status: 2, // 2 is deleted
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

        await this.updateActionCount(epochKey, epoch)

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

        // if there's no data in EpochKeyAction then do nothing
        if (rows == 0) return result

        db.delete('EpochKeyAction', {
            where: {
                epoch: epoch,
            },
        })
        return result
    }
}
