import { TableData } from 'anondb'

const _schema = [
    {
        name: 'UserState',
        indexes: [{keys: ['attesterId']}],
        rows: [
            {
                name: 'attesterId',
                type: 'String',
            },
            {
                name: 'latestTransitionedEpoch',
                type: 'Int',
                default: 0,
            },
            {
                name: 'latestTransitionedIndex',
                type: 'Int',
                defulat: 0,
            },
            {
                name: 'data',
                type: 'Object',
            },
        ]
    }
]

export const schema = _schema.map((obj) => ({
    primaryKey: '_id',
    ...obj,
    rows: [...obj.rows],
})) as TableData[]