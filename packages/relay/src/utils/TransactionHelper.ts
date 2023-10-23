import { DB } from 'anondb'
import { Action } from '../types'

export async function addActionCount(
    db: DB,
    epochKey: string,
    epoch: bigint,
    action: Action
): Promise<void> {
    await db
        .transaction(async (txDB) => {
            action(txDB)

            const counter = await db.findOne('EpochKeyAction', {
                where: {
                    epochKey: epochKey,
                },
            })

            const count = counter ? counter.count + 1 : 1

            txDB.upsert('EpochKeyAction', {
                where: {
                    epochKey: epochKey,
                },
                create: {
                    epochKey: epochKey,
                    epoch: epoch,
                    count: count,
                },
                update: {
                    count: count,
                },
            })
        })
        .catch(() => console.log('action reverted'))
}
