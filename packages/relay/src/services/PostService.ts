import { DB } from 'anondb'
import { PostgresConnector, SQLiteConnector } from 'anondb/node'
import { Helia } from 'helia'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import {
    DAY_DIFF_STAEMENT,
    DB_PATH,
    LOAD_POST_COUNT,
    UPDATE_POST_ORDER_INTERVAL,
} from '../config'
import {
    InvalidEpochRangeError,
    NoPostHistoryFoundError,
} from '../types/InternalError'
import { Post, PostStatus } from '../types/Post'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import IpfsHelper from './utils/IpfsHelper'
import ProofHelper from './utils/ProofHelper'
import TransactionManager from './utils/TransactionManager'

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
        //      4. filter posts whose are already on-chain (status = 1)
        //      5. order by
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
            WHERE p.status = 1
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

    private filterPostContent(post: Post): Partial<Post> {
        if (post.status === PostStatus.ON_CHAIN) {
            return post
        } else if (post.status === PostStatus.REPORTED) {
            const { content, ...restOfPost } = post
            return restOfPost
        }
        return {}
    }

    // returns the LOAD_POST_COUNT posts of the given page
    // page 1
    // start = (1 - 1) * LOAD_POST_COUNT = 0 ... start index
    // end = page + LOAD_POST_COUNT ... end index
    // slice(page, end) ... the end element will be excluded
    async fetchPosts(
        epks: string[] | undefined,
        page: number,
        db: DB
    ): Promise<Partial<Post>[] | null> {
        let posts: Post[]
        if (!epks) {
            const start = (page - 1) * LOAD_POST_COUNT
            if (this.cache.length == 0) {
                const statement = `
                    SELECT * FROM Post 
                    WHERE status IN (${PostStatus.ON_CHAIN}, ${PostStatus.REPORTED})
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
                posts = this.cache.slice(start, start + LOAD_POST_COUNT)
            }
        } else {
            posts = await db.findMany('Post', {
                where: {
                    epochKey: epks,
                    status: [PostStatus.ON_CHAIN, PostStatus.REPORTED],
                },
                limit: LOAD_POST_COUNT,
            })
        }

        if (!posts) return null

        return await Promise.all(
            posts.map(async (post) => {
                const votes = await db.findMany('Vote', {
                    where: { postId: post.postId },
                })
                const filteredPost = this.filterPostContent(post)
                return { ...filteredPost, votes }
            })
        )
    }

    async fetchSinglePost(
        postId: string,
        db: DB,
        status?: PostStatus
    ): Promise<Partial<Post> | null> {
        const whereClause: any = { postId }
        if (status !== undefined) {
            whereClause.status = status
        } else {
            whereClause.status = [PostStatus.ON_CHAIN, PostStatus.REPORTED]
        }

        const post = await db.findOne('Post', {
            where: whereClause,
        })

        if (!post) return null

        const filteredPost = this.filterPostContent(post)

        filteredPost.votes = await db.findMany('Vote', {
            where: { postId },
        })

        return filteredPost
    }

    async fetchMyAccountPosts(
        epks: string[],
        sortKey: 'publishedAt' | 'voteSum',
        direction: 'asc' | 'desc',
        db: DB
    ): Promise<Partial<Post>[] | null> {
        const posts = await db.findMany('Post', {
            where: {
                epochKey: epks,
                status: [
                    PostStatus.NOT_ON_CHAIN,
                    PostStatus.ON_CHAIN,
                    PostStatus.REPORTED,
                ],
            },
            orderBy: {
                [sortKey]: direction,
            },
            limit: LOAD_POST_COUNT,
        })

        if (!posts) return null

        return await Promise.all(
            posts.map(async (post) => {
                const votes = await db.findMany('Vote', {
                    where: { postId: post.postId },
                })
                const filteredPost = this.filterPostContent(post)
                return { ...filteredPost, votes }
            })
        )
    }

    async createPost(
        content: string,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        db: DB,
        synchronizer: UnirepSocialSynchronizer,
        helia: Helia
    ): Promise<string> {
        const epochKeyProof = await ProofHelper.getAndVerifyEpochKeyProof(
            publicSignals,
            proof,
            synchronizer
        )

        // post content
        const cid = (
            await IpfsHelper.createIpfsContent(helia, content)
        ).toString()
        const txHash = await TransactionManager.callContract('post', [
            epochKeyProof.publicSignals,
            epochKeyProof.proof,
            cid,
        ])

        const epoch = Number(epochKeyProof.epoch)
        const epochKey = epochKeyProof.epochKey.toString()

        // save post into db
        await db.create('Post', {
            epochKey: epochKey,
            epoch: epoch,
            transactionHash: txHash,
            status: 0,
            content,
            upCount: 0,
            downCount: 0,
            commentCount: 0,
            cid: cid,
        })

        return txHash
    }

    async updatePostStatus(
        postId: string,
        status: number,
        db: DB
    ): Promise<void> {
        await db.update('Post', {
            where: { postId },
            update: { status },
        })
    }

    async getPostHistory(
        fromEpoch: number,
        toEpoch: number,
        db: DB
    ): Promise<Post[]> {
        if (fromEpoch > toEpoch || fromEpoch < 0 || toEpoch < 0)
            throw InvalidEpochRangeError
        const posts = await db.findMany('Post', {
            where: {
                epoch: { gte: fromEpoch, lte: toEpoch },
            },
            orderBy: {
                epoch: 'asc',
            },
        })
        if (posts.length === 0) throw NoPostHistoryFoundError

        return posts
    }
}

export const postService = new PostService()
