import { DB, TransactionDB } from 'anondb'
import { Action } from '../../types'

export class ActionCountManager {
    async addActionCount(
        db: DB,
        epochKey: string,
        epoch: number,
        action: Action
    ): Promise<void> {
        await db
            .transaction(async (txDB) => {
                const actionCount = action(txDB)

                const counter = await db.findOne('EpochKeyAction', {
                    where: {
                        epochKey: epochKey,
                    },
                })

                const count = counter
                    ? counter.count + actionCount
                    : actionCount

                if (count == 0) {
                    txDB.delete('EpochKeyAction', {
                        where: {
                            epochKey: epochKey,
                        },
                    })
                } else {
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
                }
            })
            .catch(() => console.log('action reverted'))
    }
}

export default new ActionCountManager()
