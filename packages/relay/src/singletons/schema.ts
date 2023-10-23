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
        rows: [
            {
                name: 'publishedAt',
                type: 'Int',
                default: () => +new Date(),
            },
            ['postId', 'String', { optional: true }],
            ['transactionHash', 'String', { optional: true }],
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
            ['status', 'Int'],
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
        primaryKey: 'hashUserId',
        rows: [
            {
                name: 'publishedAt',
                type: 'Int',
                default: () => +new Date(),
            },
            ['commentId', 'String', { optional: true }],
            ['postId', 'String', { optional: true }],
            ['cid', 'String', { optional: true }],
            ['transactionHash', 'String'],
            ['content', 'String'],
            ['epoch', 'Int'],
            ['epochKey', 'String'],
            ['status', 'Int'],
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
