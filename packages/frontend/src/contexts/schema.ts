import { TableData } from 'anondb'
import { nanoid } from 'nanoid'

const _schema = [
    {
        name: 'Userstate',
        indexes: [{keys: ['attesterId']}],
        rows: [
            {
                name: 'attesterId', 
                type: 'String'
            },
            {
                name: 'latestTransitionedEpoch',
                type: 'Int',
                default: 0
            },
            {
                name: 'latestTransitionedIndex',
                type: 'Int',
                defulat: 0
            },
            {
                name: 'provableData',
                type: 'Object',
                relation: {
                  1: 'Int',
                  2: 'Int',
                  3: 'Int',
                  4: 'Int',
                  5: 'Int'
                }
            },
            {
                name: 'latestData',
                type: 'Object',
                relation: {
                  1: 'Int',
                  2: 'Int',
                  3: 'Int',
                  4: 'Int',
                  5: 'Int'
                }
            },
        ]
    }
]

export const schema = _schema.map((obj) => ({
    primaryKey: '_id',
    ...obj,
    rows: [
        ...obj.rows,
        {
            name: '_id',
            type: 'String',
            default: () => nanoid(),
        },
    ],
})) as TableData[]