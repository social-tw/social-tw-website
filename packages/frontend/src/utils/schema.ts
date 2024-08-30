import { schema as syncSchema } from '@unirep/core'
import { TableData } from 'anondb'

const _schema = [
    ...syncSchema,
    {
        name: 'Version',
        indexes: [{ keys: ['appAddress'] }],
        primaryKey: 'appAddress',
        rows: [
            {
                name: 'appAddress',
                type: 'String',
            },
        ],
    },
]

export const schema = _schema.map((obj) => ({
    ...obj,
    rows: [...obj.rows],
})) as TableData[]
