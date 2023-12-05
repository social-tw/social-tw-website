import { UserState } from '@unirep/core'
import { Synchronizer } from '@unirep/core'
import { DB } from 'anondb'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import {
    Circuit,
    Prover,
    ReputationProof,
    EpochKeyProof,
    SignupProof,
    UserStateTransitionProof,
    EpochKeyLiteProof,
} from '@unirep/circuits'

type UserStateDB = {
    attesterId: bigint | bigint[];
    latestTransitionedEpoch: number;
    latestTransitionedIndex: number;
    provableData: bigint[];
    latestData: bigint[];
};
export class SocialUserstate extends UserState {

    private _userstateDB: UserStateDB;

    get userstateDB() {
        return this._userstateDB; 
    }
 
    constructor(config:{
        synchronizer?: Synchronizer
        db?: DB
        attesterId: bigint | bigint[]
        unirepAddress?: string
        provider?: ethers.providers.Provider
        id: Identity
        prover: Prover
    }) {
        const { attesterId } = config;
        super(config);
        this._userstateDB = {
            attesterId,
            latestTransitionedEpoch: 0,
            latestTransitionedIndex: 0,
            provableData: [],
            latestData: []
        };
    }



}