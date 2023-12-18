import { DB } from 'anondb'

export class VoteService {
    async fetchMyAccountVotes(
        epks: string[],
        sortKey: 'publishedAt' | 'voteSum',
        direction: 'asc' | 'desc',
        db: DB
    ): Promise<any[]> {
        return db.findMany('Vote', {
            where: {
                epochKey: epks
            },
            orderBy: {
                [sortKey]: direction
            }
        })
    }

}

export const voteService = new VoteService()
