import { VoteType } from '../types'

export class Vote {
    constructor(
        public id: string,
        public epochKey: string,
        public publishedAt: number,
        public content: string,
        public voteSum: number,
        public date: string,
        public url: string,
        public type: VoteType,
    ) {}
}
