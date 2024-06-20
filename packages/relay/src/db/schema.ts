import { TableData } from 'anondb/node'
import { nanoid } from 'nanoid'
import { schema } from '@unirep/core'

const _schema = [
    {
        name: 'AccountTransaction',
        primaryKey: 'signedData',
        rows: [
            ['signedData', 'String'],
            ['address', 'String'],
            ['nonce', 'Int'],
        ],
    },
    {
        name: 'AccountNonce',
        primaryKey: 'address',
        rows: [
            ['address', 'String'],
            ['nonce', 'Int'],
        ],
    },
    // TODO: check this schema is necessary or not?
    {
        name: 'User',
        primaryKey: 'userId',
        rows: [
            ['userId', 'String'],
            ['status', 'Int'], // 0: init, 1: registered
        ],
    },
    {
        name: 'Post',
        primaryKey: 'transactionHash',
        rows: [
            {
                name: 'publishedAt',
                type: 'String',
                default: () => (+new Date()).toString(),
            },
            ['postId', 'String', { optional: true }],
            ['transactionHash', 'String'],
            ['content', 'String', { optional: true }],
            ['cid', 'String', { optional: true }],
            ['epoch', 'Int'],
            ['epochKey', 'String'],
            {
                name: 'upCount',
                type: 'Int',
                default: () => 0,
            },
            {
                name: 'downCount',
                type: 'Int',
                default: () => 0,
            },
            {
                name: 'voteSum',
                type: 'Int',
                default: () => 0,
            },
            // status 0: haven't found the post on-chain
            // status 1: found the post on-chain
            {
                name: 'status',
                type: 'Int',
                default: () => 0,
            },
            {
                name: 'commentCount',
                type: 'Int',
                default: () => 0,
            },
        ],
    },
    {
        name: 'SignUp',
        primaryKey: 'hashUserId',
        rows: [
            ['hashUserId', 'String'],
            ['status', 'Int'],
        ],
    },
    {
        name: 'Comment',
        primaryKey: 'transactionHash',
        rows: [
            {
                name: 'publishedAt',
                type: 'String',
                default: () => (+new Date()).toString(),
            },
            ['commentId', 'String', { optional: true }],
            ['postId', 'String'],
            ['cid', 'String', { optional: true }],
            ['transactionHash', 'String'],
            ['content', 'String'],
            ['epoch', 'Int'],
            ['epochKey', 'String'],
            ['status', 'Int'], // 0: init, 1: success, 2: deleted
        ],
    },
    {
        name: 'EpochKeyAction',
        primaryKey: 'epochKey',
        rows: [
            ['epochKey', 'String'],
            ['epoch', 'Int'],
            ['count', 'Int'],
        ],
    },
    {
        name: 'Vote',
        primaryKey: ['postId', 'epochKey'],
        rows: [
            {
                name: 'publishedAt',
                type: 'String',
                default: () => (+new Date()).toString(),
            },
            ['postId', 'String'],
            {
                name: 'post',
                type: 'Object',
                relation: {
                    localField: 'postId',
                    foreignField: '_id',
                    foreignTable: 'Post',
                },
            },
            ['epochKey', 'String'],
            ['epoch', 'Int'],
            {
                name: 'upVote',
                type: 'Bool',
                default: () => false,
            },
            {
                name: 'downVote',
                type: 'Bool',
                default: () => false,
            },
        ],
    },
    {
        name: 'ReportHistory',
        primaryKey: 'reportId',
        rows: [
            ['reportId', 'String'],
            ['type', 'Int'], // 0: Post, 1: Comment
            ['objectId', 'String'], // PostId or CommentId
            ['reportorEpochKey', 'String'], // Epoch Key of the person who reported
            {
                name: 'reportorClaimedRep',
                type: 'Bool', // TRUE: claimed, FALSE: not claimed
                default: () => false,
            },
            ['respondentEpochKey', 'String'], // Epoch Key of the person who was reported
            {
                name: 'respondentClaimedRep',
                type: 'Bool', // TRUE: claimed, FALSE: not claimed
                default: () => false,
            },
            ['reason', 'String'], // Reason of the report
            {
                name: 'adjudicateCount', // Number of voters
                type: 'Int',
                default: () => 0,
            },
            {
                name: 'adjudicatorsNullifier', // Nullifier of the voter who replied
                type: 'Object',
                // rows: [
                //     ['nullifier', 'String'],
                //     ['adjudicateValue', 'Int'], // 1: agree, 0: disagree
                //     ['claimed', 'Bool'], // TRUE: claimed, FALSE: not claimed
                // ],
                optional: true,
            },
            {
                name: 'status',
                type: 'Int', // 0: Voting, 1: Waiting for Tx, 2: Completed
                default: () => 0,
            },
            ['category', 'Int'],
            ['reportEpoch', 'Int'],
            {
                name: 'reportAt',
                type: 'String',
                default: () => (+new Date()).toString(),
            },
        ],
    },
]

export default _schema
    .map(
        (obj) =>
            ({
                ...obj,
                primaryKey: obj.primaryKey || '_id',
                rows: [
                    ...obj.rows,
                    {
                        name: '_id',
                        type: 'String',
                        default: () => nanoid(),
                    },
                ],
            } as TableData)
    )
    .concat(schema)
