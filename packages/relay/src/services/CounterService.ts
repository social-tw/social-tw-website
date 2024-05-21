import { DB } from 'anondb/node'

export class CounterService {
    /**
     * fetch the number of actions of three epoch keys which derived from the identity
     *
     * @param epks user provided epoch keys
     * @param db SQLiteConnector
     */
    async fetchActions(epks, db: DB): Promise<number> {
        let counter = 0
        const actions = await db.findMany('EpochKeyAction', {
            where: {
                epochKey: epks,
            },
        })

        if (actions.length > 0) {
            // flapMap the actions to [count1, count2, count3],
            // then reduce array to accumulate each count
            counter = actions
                .flatMap((action) => action.count)
                .reduce((acc, count) => acc + count)
        }

        return counter
    }
}

export const counterService = new CounterService()
