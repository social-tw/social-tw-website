import { DB } from 'anondb'
import { LOAD_POST_COUNT } from '../config'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { SnarkProof } from '@unirep/utils'
import { epochKeyService } from './EpochKeyService'
import { addActionCount } from '../utils/TransactionHelper'
import { Post } from '../types/Post'
import { ipfsService } from './IpfsService'

export class PostService {
    async fetchPosts(
        query: string | undefined,
        epks: string[] | undefined,
        db: DB
    ): Promise<Post[] | null> {
        let posts
        if (!query) {
            // Fetch posts without query
            posts = await db.findMany('Post', {
                where: {
                    status: 1,
                },
            })
        } else {
            // TODO check epks is undefined case ?
            // Fetch posts with query
            posts = await db.findMany('Post', {
                where: {
                    epochKey: epks,
                },
                limit: LOAD_POST_COUNT,
            })
        }

        // Check if posts were found
        if (!posts) {
            return null
        }

        // Fetch votes for each post and add to post object
        const postsWithVotes = await Promise.all(
            posts.map(async (post) => {
                const votes = await db.findMany('Vote', {
                    where: { postId: post._id },
                })

                return { ...post, votes }
            })
        )

        return postsWithVotes
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
                _id: id,
                status: status, // could be undefined
            },
        })

        // Check if the post exists
        if (!post) {
            return post // Return null if no post is found
        }

        // Fetch the votes for the post
        // Add the vote data to the post object
        post.votes = await db.findMany('Vote', {
            where: { postId: id },
        })

        return post
    }
}

export const postService = new PostService()
