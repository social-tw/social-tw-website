import { DB } from 'anondb/node'
import { ReputationHistory } from '../types/Reputation'

export class ReputationService {
    async findManyReputationHistory(
        fromEpoch: number,
        toEpoch: number,
        db: DB
    ): Promise<ReputationHistory[] | null> {
        const reputations = await db.findMany('ReputationHistory', {
            where: {
                epoch: {
                    gte: fromEpoch,
                    lte: toEpoch,
                },
            },
            orderBy: {
                epoch: 'desc',
            },
        })

        return reputations
    }
}

export const reputationService = new ReputationService()
