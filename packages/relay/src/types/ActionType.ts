import { TransactionDB } from 'anondb'

export enum ActionType {
    Post = 'Post',
}

export interface Action {
    (txDB: TransactionDB): number
}
