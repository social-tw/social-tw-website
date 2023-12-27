import { DB } from 'anondb'
import {
    DAY_DIFF_STAEMENT,
    DB_PATH,
    LOAD_POST_COUNT,
    UPDATE_POST_ORDER_INTERVAL,
} from '../config'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { PublicSignals, Groth16Proof } from 'snarkjs'
import { epochKeyService } from './EpochKeyService'
import { addActionCount } from '../utils/TransactionHelper'
import { Post } from '../types/Post'
import { ipfsService } from './IpfsService'
import { PostgresConnector, SQLiteConnector } from 'anondb/node'

export class PostService {
    // TODO: modify the cache data structure to avoid memory leak
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

        //      1. use CASE to cal scores by different groups (posts <= 2 days | posts > 2 days)
        //      2. use Join to cal daily upVotes & downVotes for the posts
        //      3. use Join to cal daily comments for the posts
        //      4. order by
        //         a. CASE posts <= 2 days = 0 | posts > 2 days first = 1
        //         b. sorting_score
        //         c. CASE posts <= 2 days = 0 | posts > 2 days daily_upvotes DESC
        //         d. CASE posts <= 2 days = 0 | posts > 2 days daily_comments DESC
        //         e. publishedAt DESC
        let statement = `
            SELECT
                p.*,
                CASE
                    WHEN ${DAY_DIFF_STAEMENT} <= 2 THEN
                        -0.5 * ${DAY_DIFF_STAEMENT} + p.upCount * 0.2 - p.downCount * 0.2 + p.commentCount * 0.1
                    ELSE
                        COALESCE(v.daily_upvotes, 0) + COALESCE(c.daily_comments, 0)
                END AS sorting_score,
                v.daily_upvotes AS daily_upvotes,
                c.daily_comments AS daily_comments
            FROM
                Post AS p
            LEFT JOIN (
                SELECT
                    postId,
                    SUM(CAST(upVote AS INTEGER)) AS daily_upvotes,
                    SUM(CAST(downVote AS INTEGER)) AS daily_downvotes
                FROM
                    Vote
                WHERE 
                    ${DAY_DIFF_STAEMENT} = 0
                GROUP BY
                    postId
            ) AS v ON p.postId = v.postId
            LEFT JOIN (
                SELECT
                    postId,
                    COUNT(*) AS daily_comments
                FROM
                    Comment
                WHERE
                    ${DAY_DIFF_STAEMENT} = 0
                GROUP BY
                    postId
            ) AS c ON p.postId = c.postId
            ORDER BY 
                CASE
                    WHEN ${DAY_DIFF_STAEMENT} <= 2 THEN 0
                    ELSE 1
                END, sorting_score DESC, 
                CASE
                    WHEN ${DAY_DIFF_STAEMENT} <= 2 THEN 0
                    ELSE v.daily_upvotes
                END DESC,
                CASE
                    WHEN ${DAY_DIFF_STAEMENT} <= 2 THEN 0
                    ELSE COALESCE(c.daily_comments, 0)
                END DESC,
                CAST(p.publishedAt AS INTEGER) DESC
        `
        // anondb does't provide add column api
        // use lower level db api directly from postgres / sqlite
        // for the complex sql statement
        if (DB_PATH.startsWith('postgres')) {
            const pg = db as PostgresConnector
            this.cache = (await pg.db.query(statement)).rows
        } else {
            const sq = db as SQLiteConnector
            this.cache = await sq.db.all(statement)
        }
    }

    // returns the LOAD_POST_COUNT posts of the given page
    // page 1
    // start = (1 - 1) * LOAD_POST_COUNT = 0 ... start index
    // end = page + LOAD_POST_COUNT ... end index
    // slice(page, end) ... the end element will be excluded
    async fetchPosts(
        query: string | undefined,
        epks: string[] | undefined,
        page: number,
        db: DB,
    ): Promise<Post[] | null> {
        if (!query) {
            let posts: Post[]
            const start = (page - 1) * LOAD_POST_COUNT
            if (this.cache.length == 0) {
                // anondb doesn't have offset property to
                // implement pagination
                const statement = `
                    SELECT * FROM Post 
                    WHERE status = 1 
                    ORDER BY CAST(publishedAt AS INTEGER) DESC 
                    LIMIT ${LOAD_POST_COUNT} OFFSET ${start}
                `
                if (DB_PATH.startsWith('postgres')) {
                    const pg = db as PostgresConnector
                    posts = (await pg.db.query(statement)).rows
                } else {
                    const sq = db as SQLiteConnector
                    posts = await sq.db.all(statement)
                }
            } else {
                // query the posts from the cache with given page
                posts = this.cache.slice(start, start + LOAD_POST_COUNT)
            }
            return posts
        }

        // TODO: check epks is undefined case ?
        const posts = await db.findMany('Post', {
            where: {
                epochKey: epks,
            },
            limit: LOAD_POST_COUNT,
        })

        return posts
    }

    async fetchMyAccountPosts(
        epks: string[],
        sortKey: 'publishedAt' | 'voteSum',
        direction: 'asc' | 'desc',
        db: DB,
    ): Promise<Post[]> {
        return db.findMany('Post', {
            where: {
                epochKey: epks,
            },
            orderBy: {
                [sortKey]: direction,
            },
            limit: LOAD_POST_COUNT,
        })
    }

    async createPost(
        content: string,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        db: DB,
        synchronizer: UnirepSocialSynchronizer,
        helia: Helia,
    ): Promise<string> {
        const epochKeyProof = await epochKeyService.getAndVerifyProof(
            publicSignals,
            proof,
            synchronizer,
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
        status: number | undefined,
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
