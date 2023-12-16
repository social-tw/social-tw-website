import { DB } from 'anondb/node'
import { commentTemplate, postData, voteTemplate } from '../mocks/posts'

export const getRandom = () => {
    return Math.floor(Math.random() * 1000)
}
export const DAY_IN_MILLISECOND = 86400000
export const HOUR_IN_MILLISECOND = 3600000

const getDay = (i: number) => {
    return getRandom() % 2 == 0
        ? (
              +new Date() -
              DAY_IN_MILLISECOND * 3 -
              HOUR_IN_MILLISECOND * i
          ).toString()
        : (+new Date() - HOUR_IN_MILLISECOND * i).toString()
}

export const insertPosts = async (db: DB) => {
    const posts: any[] = []
    for (let i = 0; i < postData.length; i++) {
        const post: any = {}
        Object.assign(post, postData[i])
        // make first 5 posts are posted within 2 days
        if (i > 0 && i < 5) {
            post.publishedAt = (
                +new Date() -
                DAY_IN_MILLISECOND -
                HOUR_IN_MILLISECOND * i
            ).toString()
        } else {
            post.publishedAt = (
                +new Date() -
                DAY_IN_MILLISECOND * 3 -
                HOUR_IN_MILLISECOND * i
            ).toString()
        }
        // let commentCount, upCount, downCount of each post
        // have value range from 0 ~ 999
        post.commentCount = getRandom()
        post.upCount = getRandom()
        post.downCount = getRandom()
        posts.push(post)
    }

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        await db.upsert('Post', {
            where: { postId: post.postId },
            create: {
                ...post,
            },
            update: {
                upCount: post.upCount,
                downCount: post.downCount,
                commentCount: post.commentCount,
            },
            constraintKey: 'transactionHash',
        })
    }
}

export const insertComments = async (db: DB) => {
    const comments: any[] = []

    let counter = 0
    for (let i = 0; i < postData.length; i++) {
        const random = getRandom()
        for (let j = 0; j < random; j++) {
            const comment: any = {}
            Object.assign(comment, commentTemplate)
            comment.publishedAt = getDay(i)
            comment.transactionHash = `${i}-${j}`
            comment._id = `${i}-${j}`
            comment.postId = i.toString()
            comment.commentId = counter.toString()
            comments.push(comment)

            counter++
        }
    }

    for (let i = 0; i < comments.length; i++) {
        await db.create('Comment', comments[i])
    }
}

export const insertVotes = async (db: DB) => {
    const votes: any[] = []

    for (let i = 0; i < postData.length; i++) {
        const random = getRandom()
        for (let j = 0; j < random; j++) {
            const vote: any = {}
            Object.assign(vote, voteTemplate)

            vote.publishedAt = getDay(i)
            vote.epochKey = `${i}-${j}`
            vote._id = `${i}-${j}`
            vote.postId = i.toString()
            getRandom() % 2 == 0
                ? (vote.upVote = true)
                : (vote.downVote = false)
            votes.push(vote)
        }
    }

    for (let i = 0; i < votes.length; i++) {
        await db.create('Vote', votes[i])
    }
}
