import { SERVER } from '../config'
import {
    Directions,
    FetchCommentsByEpochKeysParams,
    FetchCommentsByEpochKeysResponse,
    FetchPostsByEpochKeysParams,
    FetchPostsByEpochKeysResponse,
    FetchVotesByEpochKeysParams,
    FetchVotesByEpochKeysResponse,
    SortKeys,
} from '../types/api'

export async function fetchRelayConfig() {
    const res = await fetch(`${SERVER}/api/config`)
    return res.json()
}

export async function fetchLogin() {
    const res = await fetch(`${SERVER}/api/login`)
    return res.json()
}

export async function fetchPostsByEpochKeys({
    epochKeys,
}: FetchPostsByEpochKeysParams): Promise<FetchPostsByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const res = await fetch(
        `${SERVER}/api/my-account/posts?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return res.json()
}

export async function fetchCommentsByEpochKeys({
    epochKeys,
}: FetchCommentsByEpochKeysParams): Promise<FetchCommentsByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const res = await fetch(
        `${SERVER}/api/my-account/comments?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return res.json()
}

export async function fetchVotesByEpochKeys({
    epochKeys,
}: FetchVotesByEpochKeysParams): Promise<FetchVotesByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const res = await fetch(
        `${SERVER}/api/my-account/votes?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return res.json()
}


// [
//     {
//         "publishedAt": "1715165708743",
//         "commentId": "0",
//         "postId": "0",
//         "cid": null,
//         "transactionHash": "0xe5cf8ce6c1d580e533f00adb18a1396c35df41040b667d827486041f0cb75678",
//         "content": "testComment",
//         "epoch": 11,
//         "epochKey": "4190232842562691558271772029942358365612045623747838572139953061824266783536",
//         "status": 1,
//         "_id": "ynhUbSFveCk9864LYj528"
//     }
// ]

// [
//     {
//         "publishedAt": "1715165708743",
//         "commentId": "0",
//         "postId": "0",
//         "cid": null,
//         "transactionHash": "0xe5cf8ce6c1d580e533f00adb18a1396c35df41040b667d827486041f0cb75678",
//         "content": "testComment",
//         "epoch": 11,
//         "epochKey": "4190232842562691558271772029942358365612045623747838572139953061824266783536",
//         "status": 1,
//         "_id": "ynhUbSFveCk9864LYj528"
//     }
// ]

// [
//     {
//         "publishedAt": "1715165706503",
//         "postId": "0",
//         "transactionHash": "0xdd2d0eea1f54f3e5d4e53571c5b38a4cecc9d4a9b2e4a43250822c09bf7f031e",
//         "content": "test1",
//         "cid": null,
//         "epoch": 0,
//         "epochKey": "13404125503094648691427898094848951247764763170087434203954306073161909619754",
//         "upCount": 1,
//         "downCount": 0,
//         "voteSum": 0,
//         "status": 1,
//         "commentCount": 1,
//         "_id": "EE8ZrOxY86t3INGXe0MxU",
//         "votes": [
//             {
//                 "publishedAt": "1715167474122",
//                 "postId": "0",
//                 "epochKey": "9219596159119527157909670125758557090902271128001400800689269294614464115612",
//                 "epoch": 11,
//                 "upVote": 1,
//                 "downVote": 0,
//                 "_id": "kIUxJCgqi-MMfFSXiMTDa"
//             }
//         ]
//     }
// ]

// {
//     "publishedAt": "1715165706503",
//     "postId": "0",
//     "transactionHash": "0xdd2d0eea1f54f3e5d4e53571c5b38a4cecc9d4a9b2e4a43250822c09bf7f031e",
//     "content": "test1",
//     "cid": null,
//     "epoch": 0,
//     "epochKey": "13404125503094648691427898094848951247764763170087434203954306073161909619754",
//     "upCount": 1,
//     "downCount": 0,
//     "voteSum": 0,
//     "status": 1,
//     "commentCount": 1,
//     "_id": "EE8ZrOxY86t3INGXe0MxU",
//     "votes": [
//         {
//             "publishedAt": "1715167474122",
//             "postId": "0",
//             "epochKey": "9219596159119527157909670125758557090902271128001400800689269294614464115612",
//             "epoch": 11,
//             "upVote": 1,
//             "downVote": 0,
//             "_id": "kIUxJCgqi-MMfFSXiMTDa"
//         }
//     ]
// }