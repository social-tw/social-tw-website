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
                epochKey: epks,
            },
            orderBy: {
                [sortKey]: direction,
            },
            include: {
                post: true,
            },
        })
    }
}

export const voteService = new VoteService()
