import { UserState } from '@unirep/core'
import { Synchronizer } from '@unirep/core'
import { DB } from 'anondb'
import { MemoryConnector } from 'anondb/web'
import { constructSchema } from 'anondb/types'
import { IndexedDBConnector } from 'anondb/web'
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
import { schema }  from './schema'

function toDecString(content: bigint | string | number) {
    return BigInt(content).toString()
}


export class SocialUserstate extends UserState {

    private _db: DB;

    private _chainId: number

    private initDataComplete = false

    get chainId() {
        return this._chainId
    }

    constructor(config:{
        synchronizer?: Synchronizer
        db?: DB
        userdb?: DB
        attesterId: bigint | bigint[]
        unirepAddress?: string
        provider?: ethers.providers.Provider
        id: Identity
        prover: Prover
    }) {
        super(config);
        const { userdb, attesterId } = config;
        this._db = userdb ?? new IndexedDBConnector(constructSchema(schema))
        this._chainId = -1 // Unirep v2-beta-6
        this.initData(attesterId).then(() => (this.initDataComplete = true))
    }
      
    // shall check if this method is needed (ust might use db.upsert)
    initData = async (attesterId: bigint | bigint[]) => {     
        if (Array.isArray(attesterId)) {
            this._db.create('Userstate', attesterId.map(id => ({
                attesterId: id,
                latestTransitionedEpoch: this.sync.calcCurrentEpoch(),
                latestTransitionedIndex: -1,
                provableData: Array(this.sync.settings.fieldCount).fill(BigInt(0)),
                latestData: Array(this.sync.settings.fieldCount).fill(BigInt(0))
            })))
        } else {
            this._db.create('Userstate', {
                attesterId,
                latestTransitionedEpoch: this.sync.calcCurrentEpoch(),
                latestTransitionedIndex: -1,
                provableData: Array(this.sync.settings.fieldCount).fill(BigInt(0)),
                latestData: Array(this.sync.settings.fieldCount).fill(BigInt(0))
            })
        }
    }

    public override getData = async (
        toEpoch?: number,
        attesterId: bigint | string = this.sync.attesterId
    ): Promise<bigint[]> => {
        
        const _attesterId = toDecString(attesterId)
        const _latestTransitionedEpoch = await this.latestTransitionedEpoch(_attesterId)

        // check if searching for db
        if(toEpoch && (toEpoch !== _latestTransitionedEpoch - 1)){
            const data = await super.getData(toEpoch, attesterId); 
            return data
        }
        
        //check if usted in different device
        const nullifiers = [
            0,
            this.sync.settings.numEpochKeyNoncePerEpoch,
        ].map((v) =>
            genEpochKey(
                this.id.secret,
                _attesterId,
                _latestTransitionedEpoch,
                v,
                this.chainId
            ).toString()
        )

        const nullifier1Used = await this.sync.nullifierExist(nullifiers[0])
        const nullifier2Used = await this.sync.nullifierExist(nullifiers[1])

        if(nullifier1Used || nullifier2Used){
            const data = await super.getData(undefined, attesterId)
            return data
        } else {
            const foundData = await this._db.findOne('Userstate', {
                where: {
                    attesterId: _attesterId
                }
            })

            if(!foundData){
                throw new Error(
                    '@unirep/core: UserState data has not initialized'
                )
            }

            return foundData.provableData
        }
    }


    override latestTransitionedEpoch =  async (
        attesterId: bigint | string = this.sync.attesterId
    ): Promise<number> => {
        const foundData = await this._db.findOne('Userstate', {
            where: {
                attesterId
            }
        })
        return foundData.latestTransitionedEpoch
    }


    public override getProvableData = async (
        attesterId: bigint | string = this.sync.attesterId
    ): Promise<bigint[]> => {
        const foundData = await this._db.findOne('Userstate', {
            where: {
                attesterId
            }
        })
        return foundData.provableData
    }

    //
    // override latestStateTreeLeafIndex = async (
    //     epoch?: number,
    //     attesterId: bigint | string = this.sync.attesterId
    // ): Promise<number> => {
    //     const _attesterId = toDecString(attesterId)
    //     const currentEpoch = epoch ?? this.sync.calcCurrentEpoch(_attesterId)
    //     const latestTransitionedEpoch = await this.latestTransitionedEpoch(
    //         _attesterId
    //     )
    //     if (latestTransitionedEpoch !== currentEpoch)
    //         throw new Error(
    //             '@unirep/core:UserState user has not transitioned to epoch'
    //         )

    //     const foundData = await this._db.findOne('Userstate', {
    //         where: {
    //             latestTransitionedEpoch,
    //             attesterId: _attesterId
    //         }
    //     })
    //     if (!foundData)
    //         throw new Error(
    //             '@unirep/core:UserState unable to find state tree leaf index'
    //         )
    //     return foundData.latestTransitionedIndex
    // }

    
    updateUserData = async (
        attesterId: bigint | string,
        latestData: bigint[]
    ) => {
        const _attesterId = toDecString(attesterId)
        const foundData = await this._db.findOne('Userstate', {
            where: {
                _attesterId
            }
        })
        if (!foundData) {
            throw new Error('User state not found for attesterId: ' + _attesterId);
        }

        const provableData = await this.getProvableData();
        const newData: bigint[] = []
        for(let i = 0; i < provableData.length; i++){
            newData[i] = latestData[i] + provableData[i] 
        }
        const latestTransitionedIndex = await super.latestStateTreeLeafIndex()
        const latestTransitionedEpoch = await this.sync.loadCurrentEpoch();



        //update
        await this._db.update('Userstate', {
            where: {
                _attesterId
            },
            update: {
                latestTransitionedIndex,
                latestTransitionedEpoch,
                provableData: newData
            }
        })

        console.log('User db updated successful.');
    }


}



