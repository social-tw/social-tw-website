import { DB } from 'anondb'
import { APP_ADDRESS, LOAD_POST_COUNT } from '../config'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { SnarkProof } from '@unirep/utils'
import { epochKeyService } from './EpochKeyService'
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'
import { ethers } from 'hardhat'
import TransactionManager from '../singletons/TransactionManager'
import { addActionCount } from '../utils/TransactionHelper'
import { Post } from '../types/Post'

export class PostService {
    async fetchPosts(
        query: string | undefined,
        epks: string[] | undefined,
        db: DB
    ): Promise<Post[] | null> {
        if (!query) {
            const posts = await db.findMany('Post', {
                where: {
                    status: 1,
                },
            })
            return posts
        }

        // TODO check epks is undefined case ?
        const posts = await db.findMany('Post', {
            where: {
                epochKey: epks,
            },
            limit: LOAD_POST_COUNT,
        })

        return posts
    }

    async createPost(
        content: string,
        publicSignals: (bigint | string)[],
        proof: SnarkProof,
        db: DB,
        synchronizer: UnirepSocialSynchronizer,
        helia: Helia
    ): Promise<string> {
        const epochKeyProof = await epochKeyService.getAndVerifyProof(
            publicSignals,
            proof,
            synchronizer
        )
        const appContract = new ethers.Contract(APP_ADDRESS, ABI)

        // post content
        const calldata = appContract.interface.encodeFunctionData('post', [
            epochKeyProof.publicSignals,
            epochKeyProof.proof,
            content,
        ])

        // store content into helia ipfs node with json plain
        const { json } = await eval("import('@helia/json')")
        const heliaJson = json(helia)
        const IPFSContent = {
            content: content,
        }
        const cid = await heliaJson.add(JSON.stringify(IPFSContent))

        const hash = await TransactionManager.queueTransaction(
            APP_ADDRESS,
            calldata
        )

        const epoch = Number(epochKeyProof.epoch)
        const epochKey = epochKeyProof.epochKey.toString()

        // after post data stored in DB, should add 1 to epoch key counter
        await addActionCount(db, epochKey, epoch, (txDB) => {
            txDB.create('Post', {
                content: content,
                cid: cid.toString(),
                epochKey: epochKey,
                epoch: epoch,
                transactionHash: hash,
                status: 0,
            })
            return 1
        })
        return hash
    }

    async fetchSinglePost(id: string, db: DB, status: number | undefined): Promise<Post | null> {
        const post = await db.findOne('Post', {
            where: {
                postId: id,
                status: status, // could be undefined
            },
        })

        return post
    }
}

export const postService = new PostService()
