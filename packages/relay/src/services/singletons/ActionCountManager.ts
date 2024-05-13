import { DB } from 'anondb'

export class ActionCountManager {
    // cancel the transaction to send operations
    // somehow it will cause error, the data will not be flushed into db immediately
    async addActionCount(
        db: DB,
        epochKey: string,
        epoch: number,
        actionCount: number,
    ): Promise<void> {
        const counter = await db.findOne('EpochKeyAction', {
            where: {
                epochKey: epochKey,
            }
        })

        const count = counter
            ? counter.count + actionCount
            : actionCount

        if (count == 0) {
            await db.delete('EpochKeyAction', {
                where: {
                    epochKey: epochKey,
                }
            })
        } else {
            await db.upsert('EpochKeyAction', {
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
        }
    }
}

export default new ActionCountManager()
