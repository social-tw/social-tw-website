import { DB } from 'anondb'
import { DB_PATH, LOAD_POST_COUNT, UPDATE_POST_ORDER_INTERVAL } from '../config'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { SnarkProof } from '@unirep/utils'
import { epochKeyService } from './EpochKeyService'
import { addActionCount } from '../utils/TransactionHelper'
import { Post } from '../types/Post'
import { ipfsService } from './IpfsService'
import { PostgresConnector, SQLiteConnector } from 'anondb/node'

export class PostService {
    private cache: string[] = []

    async start(db: DB): Promise<void> {
        const rows = await db.count('Post', {})
        if (rows > 0) {
            // fetch all posts during the initalization
            await this.updateOrder(db)
        }

        // update post order every 3 hrs
        setInterval(async () => {
            await this.updateOrder(db)
        }, UPDATE_POST_ORDER_INTERVAL)
    }

    async updateOrder(db: DB): Promise<void> {
        console.log("sorting posts...")
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
        let DAYDIFF: string;
        const SQL_LITE_DAYDIFF = "(JULIANDAY('now') - JULIANDAY(DATETIME(publishedAt, 'unixepoch')))"
        const POSTGRES_DAYDIFF = "(EXTRACT (DAY FROM NOW()::timestamp - TO_TIMESTAMP(publishedAt, 'YYYY-MM-DD')))"
        if (DB_PATH.startsWith('postgres')) {
            DAYDIFF = POSTGRES_DAYDIFF
        } else {
            DAYDIFF = SQL_LITE_DAYDIFF
        }

        let statement = `
            SELECT POSTSLETWO._id
            FROM (
                SELECT *,
                (${DAYDIFF} * (-0.5)) + (upCount * 0.2) - (downCount * 0.2) + (commentCount * 0.1) AS SORT_ALGO
                FROM Post
                WHERE ${DAYDIFF} <= 2
                ORDER BY SORT_ALGO DESC, publishedAt DESC
            ) AS POSTSLETWO
            UNION
            SELECT POSTSGTTWO._id
            FROM (
                SELECT *,
                (upCount + commentCount) AS FIRST_PRIORTY
                FROM Post
                WHERE ${DAYDIFF} > 2
                ORDER BY FIRST_PRIORTY DESC, upCount DESC, commentCount DESC
            ) AS POSTSGTTWO
        `
        let results: any
        // anondb does't provide add column api
        // use lower level db api directly from postgres / sqlite
        // for the complex sql statement
        if (DB_PATH.startsWith('postgres')) {
            // postgres situation
            const pg = db as PostgresConnector
            results = await pg.db.query(statement)
        } else {
            // sqlite situation
            const sq = db as SQLiteConnector
            results = await sq.db.all(statement)
        }

        // TODO: no result
        console.log("Query Result:", results)

        // this.cache = results.rows.map((post: any) => post.post_id)
    }

    async fetchPosts(
        query: string | undefined,
        epks: string[] | undefined,
        offset: number,
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

        console.log("Cache", this.cache)
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
