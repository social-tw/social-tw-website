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
import {
    stringifyBigInts,
    genEpochKey,
    genStateTreeLeaf,
    F,
    MAX_EPOCH,
} from '@unirep/utils'


type UserStateDB = {
    attesterId: bigint | bigint[];
    latestTransitionedEpoch: number;
    latestTransitionedIndex: number;
    provableData: bigint[];
    latestData: bigint[];
};

function toDecString(content: bigint | string | number) {
    return BigInt(content).toString()
}


export class SocialUserstate extends UserState {

    private _userstateDB: UserStateDB;

    get userstateDB() {
        return this._userstateDB; 
    }
 
    set userstateDB(newUserstateDB: UserStateDB) {
        this._userstateDB = newUserstateDB;
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
            latestTransitionedEpoch: -1,
            latestTransitionedIndex: -1,
            provableData: [],
            latestData: []
        };
    }

    public override getData = async (
        toEpoch?: number,
        attesterId: bigint | string = this.sync.attesterId
    ): Promise<bigint[]> => {
        let data = Array(this.sync.settings.fieldCount).fill(BigInt(0))

        // attested from whom
        const _attesterId = toDecString(attesterId)
        // const orClauses = [] as any[]

        //return latestData
        if(!toEpoch){
            return this._userstateDB.latestData
        }

        //bool: find if this user signed up
        // const signup = await this.sync.db.findOne ('UserSignUp', {
        //     where: {
        //         commitment: this.commitment.toString(),
        //         attesterId: _attesterId,
        //     },
        // }) 
        // if (signup) {
        //     orClauses.push({
        //         epochKey: signup.commitment,
        //         epoch: MAX_EPOCH,
        //     })
        // }

        //generate all epoch key and its nullifier
        // const allNullifiers = [] as any
        // for (let x = signup?.epoch ?? 0; x <= toEpoch; x++) {
        //     allNullifiers.push(
        //         ...[0, this.sync.settings.numEpochKeyNoncePerEpoch].map((v) =>
        //             genEpochKey(
        //                 this.id.secret,
        //                 _attesterId,
        //                 x,
        //                 v,
        //                 this.chainId
        //             ).toString()
        //         )
        //     )
        // }

        //sort nullifier
        // const sortedNullifiers = await this.sync.db.findMany('Nullifier', {
        //     where: {
        //         attesterId: _attesterId,
        //         nullifier: allNullifiers,
        //     },
        //     orderBy: {
        //         epoch: 'asc',
        //     },
        // })

        //iterate every epoch 
        // for (let x = signup?.epoch ?? 0; x <= toEpoch; x++) {
        //     const epks = Array(this.sync.settings.numEpochKeyNoncePerEpoch)
        //         .fill(null)
        //         .map((_, i) =>
        //             genEpochKey(
        //                 this.id.secret,
        //                 _attesterId,
        //                 x,
        //                 i,
        //                 this.chainId
        //             ).toString()
        //         )
        //     const nullifiers = [
        //         0,
        //         this.sync.settings.numEpochKeyNoncePerEpoch,
        //     ].map((v) =>
        //         genEpochKey(
        //             this.id.secret,
        //             _attesterId,
        //             x,
        //             v,
        //             this.chainId
        //         ).toString()
        //     )
        //     let usted = false
        //     for (const { nullifier, epoch } of sortedNullifiers) {
        //         if (epoch > x) {
        //             break
        //         }
        //         if (epoch === x) {
        //             usted = true
        //             break
        //         }
        //     }
        //     const signedup = await this.sync.db.findOne('UserSignUp', {
        //         where: {
        //             attesterId: _attesterId,
        //             commitment: this.commitment.toString(),
        //             epoch: x,
        //         },
        //     })
        //     if (!usted && !signedup) continue
        //     orClauses.push({
        //         epochKey: epks,
        //         epoch: x,
        //     })
        // }
        // if (orClauses.length === 0) return data
        // const attestations = await this.sync.db.findMany('Attestation', {
        //     where: {
        //         OR: orClauses,
        //         attesterId: _attesterId,
        //     },
        //     orderBy: {
        //         index: 'asc',
        //     },
        // })
        // for (const a of attestations) {
        //     const { fieldIndex } = a
        //     let currentNonce = BigInt(-1)
        //     if (fieldIndex < this.sync.settings.sumFieldCount) {
        //         data[fieldIndex] = (data[fieldIndex] + BigInt(a.change)) % F
        //     } else {
        //         const { nonce } = this.parseReplData(BigInt(a.change))
        //         if (nonce > currentNonce) {
        //             data[fieldIndex] = BigInt(a.change)
        //             currentNonce = nonce
        //         }
        //     }
        // }

        // find for the lower nearest provableData
        for(let to = toEpoch; to > 0; to--) {
            let foundData = this._userstateDB.provableData.find(
                singleData => singleData.toEpoch === to
            );
            if(foundData) {
                data = foundData.data
                break
            };
        }

        return data
    }


    override latestTransitionedEpoch =  async (
        attesterId: bigint | string = this.sync.attesterId
    ): Promise<number> => {
        return this._userstateDB.latestTransitionedEpoch
    }






}