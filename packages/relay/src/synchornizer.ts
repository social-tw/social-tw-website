import { DB, TransactionDB } from 'anondb'
import { ethers } from 'ethers'
import { Prover } from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import { UserRegisterStatus } from './types/UserRegisterStatus'

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
                eventNames: ['Post', 'UserSignUp'],
            },
        }
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
                content,
            },
            update: {
                status: 1,
                postId,
            },
        })
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
}
