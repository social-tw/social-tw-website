import { schema } from '@unirep/core'
import { TableData } from 'anondb/node'
import { nanoid } from 'nanoid'

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
    {
        name: 'User',
        primaryKey: 'userId',
        rows: [
            ['userId', 'String'],
            ['status', 'Int'] // 0: init, 1: registered 
        ]
    }
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
