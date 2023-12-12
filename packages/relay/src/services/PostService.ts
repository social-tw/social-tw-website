import { DB } from 'anondb'
import {
    DAY_DIFF_STAEMENT,
    DB_PATH,
    LOAD_POST_COUNT,
    UPDATE_POST_ORDER_INTERVAL,
} from '../config'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { SnarkProof } from '@unirep/utils'
import { epochKeyService } from './EpochKeyService'
import { addActionCount } from '../utils/TransactionHelper'
import { Post } from '../types/Post'
import { ipfsService } from './IpfsService'
import { PostgresConnector, SQLiteConnector } from 'anondb/node'

export class PostService {
    private cache: Post[] = []

    async start(db: DB): Promise<void> {
        const rows = await db.count('Post', {})
        if (rows > 0) {
            // fetch all posts during the initalization
            await this.updateOrder(db)
        }

        // update the order of post table in the given interval
        setInterval(async () => {
            await this.updateOrder(db)
        }, UPDATE_POST_ORDER_INTERVAL)
    }

    async updateOrder(db: DB): Promise<void> {
        //      if user just posted, get the first ten result from db
        //      pop last one and insert new post to the first element

        //      1. The post that the user just posted
        //      2. Follow the equation and sort them descendingly.
        //         How many days before * (-0.5) + upvote count * 0.2 - downvote count * 0.2 + comment count * 0.1
        //         a. good post 2 days ago（50 upvotes, 2 down votes, 14 comments）= 10
        //         b. bad post just posted（10 upvotes, 17 downvotes, 8 comments）= -0.6
        //      3. The posts >= 3 days ago should no longer follow this rule, but be sorted at the bottom based on the logic below
        //         a. The post with the most upvotes and comments of the day
        //         b. The post with more upvotes of the day
        //         c. The post with more comments of the day
        //         d. The remaining posts of the day
        //      4. The order of the posts will be refreshed every time the user visits / refreshes the Homepage

        //      select posts le 2 days and order them by the rules
        //      union
        //      select post gt 2 days and order them by the rules
        let statement = `
            SELECT publishedAt, postId, transactionHash, content, cid, epoch, epochKey, upCount, downCount, voteSum, status, commentCount, _id FROM (
                SELECT * FROM (
                    SELECT *, 1 AS FILTER
                    FROM (
                        SELECT *, ROW_NUMBER() over ( ORDER BY (${DAY_DIFF_STAEMENT} * (-0.5)) + (upCount * 0.2) - (downCount * 0.2) + (commentCount * 0.1) DESC, publishedAt DESC ) AS OD
                        FROM Post 
                        WHERE ${DAY_DIFF_STAEMENT} <= 2
                    )
                    UNION
                    SELECT *, 2 AS FILTER
                    FROM (
                        SELECT *, ROW_NUMBER() over ( ORDER BY (upCount + commentCount) DESC, upCount DESC, commentCount DESC, publishedAt DESC ) AS OD
                        FROM Post
                        WHERE ${DAY_DIFF_STAEMENT} > 2
                    )
                ) ORDER BY FILTER, OD
            )
        `
        // anondb does't provide add column api
        // use lower level db api directly from postgres / sqlite
        // for the complex sql statement
        if (DB_PATH.startsWith('postgres')) {
            const pg = db as PostgresConnector
            this.cache = await pg.db.query(statement)
        } else {
            const sq = db as SQLiteConnector
            this.cache = await sq.db.all(statement)
        }
    }

    async fetchPosts(
        query: string | undefined,
        epks: string[] | undefined,
        offset: number,
        db: DB
    ): Promise<Post[] | null> {
        if (!query) {
            console.log('Cache', this.cache)
            const posts = await db.findMany('Post', {
                where: {
                    status: 1,
                },
            })
            return posts
        }

        // pagination
        const postIds = this.cache.slice(offset, offset + LOAD_POST_COUNT - 1)

        const posts = await db.findMany('Post', {
            where: {
                postId: postIds,
                epochKey: epks,
            },
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

        // post content
        const cid = await ipfsService.createIpfsContent(helia, content)
        const txnHash = await epochKeyService.callContract('post', [
            epochKeyProof.publicSignals,
            epochKeyProof.proof,
            content,
        ])

        const epoch = Number(epochKeyProof.epoch)
        const epochKey = epochKeyProof.epochKey.toString()

        // after post data stored in DB, should add 1 to epoch key counter
        await addActionCount(db, epochKey, epoch, (txDB) => {
            txDB.create('Post', {
                content: content,
                cid: cid.toString(),
                epochKey: epochKey,
                epoch: epoch,
                transactionHash: txnHash,
                status: 0,
            })
            return 1
        })

        return txnHash
    }

    async fetchSinglePost(
        id: string,
        db: DB,
        status: number | undefined
    ): Promise<Post | null> {
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
