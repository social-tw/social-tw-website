import { DB, TransactionDB } from 'anondb'
import { ethers } from 'ethers'
import { Prover } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import { UserRegisterStatus } from './types'
import schema from './singletons/schema'
import { ENV, IS_IN_TEST, RESET_DATABASE } from './config'

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
        if (RESET_DATABASE != 'true' || ENV == 'product' || IS_IN_TEST) return
        console.log('start reset all data in postgres')
        schema.map((obj) => {
            this.db.delete(obj.name, { where: {} })
        })
    }

    async handlePost({ event, db, decodedData }: EventHandlerArgs) {
        const transactionHash = event.transactionHash
        const findPost = await this.db.findOne('Post', {
            where: {
                transactionHash,
            },
        })

        const epochKey = BigInt(event.topics[1]).toString(10)
        const postId = BigInt(event.topics[2]).toString()
        const epoch = Number(event.topics[3])
        const content = decodedData.content

        console.log('----handlePost----')
        console.log('Epoch key:', epochKey)
        console.log('Post id:', postId)
        console.log('Epoch:', epoch)
        console.log('Content:', content)
        console.log('--------------------')

        if (findPost) {
            db.update('Post', {
                where: {
                    _id: findPost._id,
                },
                update: {
                    status: 1,
                    postId,
                },
            })
        } else {
            db.create('Post', {
                postId,
                epochKey,
                epoch,
                transactionHash,
                status: 1,
                content,
                upCount: 0,
                downCount: 0,
                commentCount: 0,
            })
        }

        return true
    }

    async handleComment({ event, db, decodedData }: EventHandlerArgs) {
        const transactionHash = event.transactionHash
        const epochKey = BigInt(event.topics[1]).toString(10)
        const postId = BigInt(event.topics[2]).toString()
        const commentId = BigInt(event.topics[3]).toString()
        const epoch = Number(decodedData.epoch)
        const content = decodedData.content

        console.log('----handleComment---')
        console.log('Epoch key:', epochKey)
        console.log('Post id:', postId)
        console.log('Comment id:', commentId)
        console.log('Epoch:', epoch)
        console.log('Content:', content)
        console.log('--------------------')

        const findComment = await this.db.findOne('Comment', {
            where: {
                transactionHash,
            },
        })
        if (findComment) {
            db.update('Comment', {
                where: {
                    _id: findComment._id,
                },
                update: {
                    commentId,
                    status: 1,
                },
            })
        } else {
            db.create('Comment', {
                commentId,
                postId,
                transactionHash,
                content,
                epoch,
                epochKey,
                status: 1,
            })
        }

        // atrieve the comment count of the post
        const commentCount = await this.db.count('Comment', {
            postId,
        })

        db.update('Post', {
            where: {
                postId,
            },
            update: {
                commentCount: commentCount + (findComment ? 0 : 1),
            },
        })

        return true
    }

    async handleUpdatedComment({ event, db, decodedData }: EventHandlerArgs) {
        const postId = BigInt(event.topics[2]).toString()
        const commentId = BigInt(event.topics[3]).toString()
        const newContent = decodedData.newContent

        // FIXME: Should we check the epoch key?

        db.update('Comment', {
            where: {
                postId,
                commentId,
            },
            update: {
                newContent,
            },
        })

        return true
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

        db.create('SignUp', {
            hashUserId: hashUserId,
            status: status,
        })
    }

    // overwrite handleEpochEnded to delete all epochKeyAction when the epoch ended
    async handleEpochEnded({ event, db, decodedData }: EventHandlerArgs) {
        super.handleEpochEnded({ event, db, decodedData })
        const epoch = Number(decodedData.epoch)

        const rows = await this.db.count('EpochKeyAction', {
            epoch: epoch,
        })

        // if there's no data in EpochKeyAction then do nothing
        if (rows == 0) return

        db.delete('EpochKeyAction', {
            where: {
                epoch: epoch,
            },
        })
        return true
    }
}
