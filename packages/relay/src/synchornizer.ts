import { DB, TransactionDB } from 'anondb'
import { ethers } from 'ethers'
import { Prover } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'

export enum ActionType {
    Post = 'Post',
}

export interface UnirepSocialConfig {
    postRep: number
    commentRep: number
    airdropRep: number
}

export class UnirepSocialSynchronizer extends Synchronizer {
    unirepSocialContract: ethers.Contract
    socialConfig: UnirepSocialConfig

    constructor(
        config: {
            db: DB
            attesterId: bigint | bigint[]
            prover: Prover
            provider: ethers.providers.Provider
            unirepAddress: string
        },
        unirepSocialContract: ethers.Contract,
        unirepSocialConfig: UnirepSocialConfig = {
            postRep: 5,
            commentRep: 3,
            airdropRep: 30,
        }
    ) {
        super(config)
        this.unirepSocialContract = unirepSocialContract
        this.socialConfig = unirepSocialConfig
    }

    async loadNewEvents(fromBlock, toBlock) {
        return (
            (await Promise.all([
                this.unirepSocialContract.queryFilter(
                    this.unirepSocialFilter,
                    fromBlock,
                    toBlock
                ),
            ])) as any
        ).flat()
    }

    get unirepSocialFilter() {
        const [_PostSubmitted] =
            this.unirepSocialContract.filters.PostSubmitted().topics as string[]
        // Unirep Social events
        return {
            address: this.unirepSocialContract.address,
            topics: [[_PostSubmitted]],
        }
    }

    async postSubmittedEvent(event: ethers.Event, db: TransactionDB) {
        const transactionHash = event.transactionHash
        const findPost = await this._db.findOne('Post', {
            where: {
                transactionHash,
            },
        })

        const decodedData = this.unirepSocialContract.interface.decodeEventLog(
            'PostSubmitted',
            event.data
        )
        const onChainId = BigInt(event.topics[2]).toString()
        const epoch = Number(event.topics[1])
        const epochKey = BigInt(event.topics[3]).toString(10)
        const minRep = decodedData.minRep.toNumber()
        const hashedContent = decodedData._contentHash

        if (findPost) {
            db.update('Post', {
                where: {
                    _id: findPost._id,
                    hashedContent,
                },
                update: {
                    status: 1,
                    onChainId,
                },
            })
        } else {
            db.create('Post', {
                onChainId,
                transactionHash,
                hashedContent,
                epochKey,
                epoch,
                proveMinRep: minRep !== 0 ? true : false,
                minRep,
                posRep: 0,
                negRep: 0,
                status: 1,
            })
        }
        db.upsert('Record', {
            where: {
                transactionHash,
            },
            update: {
                confirmed: 1,
            },
            create: {
                to: epochKey,
                from: epochKey,
                upvote: 0,
                downvote: this.socialConfig.postRep,
                epoch,
                action: ActionType.Post,
                transactionHash,
                data: findPost?._id ?? '',
                confirmed: 1,
            },
        })
    }
}
