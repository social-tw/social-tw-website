import { TableData } from 'anondb'
import { nanoid } from 'nanoid'

const _schema = [
    {
        name: 'Userstate',
        indexes: [{keys: ['attesterId']}],
        rows: [
            ['attesterId', 'String'],
            ['latestTransitionedEpoch', 'Int'],
            ['latestTransitionedIndex','Int'],
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