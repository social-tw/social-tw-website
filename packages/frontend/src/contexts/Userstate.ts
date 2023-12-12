import { UserState } from '@unirep/core'
import { Synchronizer } from '@unirep/core'
import { DB } from 'anondb'
import { constructSchema } from 'anondb/types'
import { IndexedDBConnector } from 'anondb/web'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { Prover } from '@unirep/circuits'
import { genEpochKey } from '@unirep/utils'
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
        this._initData(attesterId).then(() => (this.initDataComplete = true))
    }
      
    _initData = async (attesterId: bigint | bigint[]) => {     
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


    public async originGetData(
        toEpoch?: number,
        attesterId: bigint | string = this.sync.attesterId
    ): Promise<bigint[]> {
        return await super.getData(toEpoch, attesterId);
    }

    public override getData = async (
        toEpoch?: number,
        attesterId: bigint | string = this.sync.attesterId
    ): Promise<bigint[]> => {
        
        const _attesterId = toDecString(attesterId)
        const _latestTransitionedEpoch = await this.latestTransitionedEpoch(_attesterId)

        // check if not searching for provableData
        if(toEpoch && (toEpoch !== _latestTransitionedEpoch - 1)){
            const data = await this.originGetData(toEpoch, attesterId); 
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
            const data = await this.originGetData(undefined, attesterId)
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

    // call this after ust
    public async updateUserData (
        attesterId: bigint | string = this.sync.attesterId,
    ) {
        const _attesterId = toDecString(attesterId)
        const foundData = await this._db.findOne('Userstate', {
            where: {
                _attesterId
            }
        })
        if (!foundData) {
            throw new Error('User state not found for attesterId: ' + _attesterId);
        }

        // calc new provableData
        const oldEpoch = foundData.latestTransitionedEpoch
        const provableData = foundData.provableData
        const changes =  await this.sync.db.findMany('Attestation', {
            where: {
                attesterId,
                epoch: oldEpoch
            }
        })
        const newProvableData: bigint[] = new Array(5).fill(0)
        for (const [i, _change] of changes.entries()) {
            newProvableData[i] = provableData[i] + Number(_change.change);
        }

        const latestTransitionedIndex = await super.latestStateTreeLeafIndex()
        const latestTransitionedEpoch = await this.sync.loadCurrentEpoch();

        // updata new data
        await this._db.update('Userstate', {
            where: {
                _attesterId
            },
            update: {
                latestTransitionedIndex,
                latestTransitionedEpoch,
                provableData: newProvableData
            }
        })

        console.log('User db updated successfully.');
    }


}



