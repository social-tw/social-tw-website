import { DB, TransactionDB } from 'anondb'
import { ethers } from 'ethers'
import { Prover } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'

export enum ActionType {
    Post = 'Post',
}

type EventHandlerArgs = {
    event: ethers.Event
    decodedData: { [key: string]: any }
    db: TransactionDB
}

let tempUnirepSocialContract: ethers.Contract

export class UnirepSocialSynchronizer extends Synchronizer {
    unirepSocialContract: ethers.Contract

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
        this.unirepSocialContract = unirepSocialContract
    }

    get contracts() {
        return {
            ...super.contracts,
            [tempUnirepSocialContract.address]: {
                contract: tempUnirepSocialContract,
                eventNames: ['Post'],
            },
        }
    }

    async handlePost({ event, db, decodedData }: EventHandlerArgs) {
        const transactionHash = event.transactionHash
        const findPost = await this._db.findOne('Post', {
            where: {
                transactionHash,
            },
        })

        const epochKey = BigInt(event.topics[1]).toString(10)
        const postId = BigInt(event.topics[2]).toString()
        const epoch = Number(event.topics[3])
        const hashedContent = decodedData.contentHash

        db.upsert('Post', {
            where: {
                _id: findPost._id,
            },
            create: {
                postId,
                epochKey,
                epoch,
                transactionHash,
                status: 1,
            },
            update: {
                status: 1,
                postId,
            },
        })
    }
}
