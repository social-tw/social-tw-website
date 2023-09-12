import { DB } from "anondb";
import User from "../../src/data/User";
import { UserState } from "@unirep/core";
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { Prover } from '@unirep/circuits'

export class UserStateFactory {
    db: DB
    provider: ethers.providers.JsonRpcProvider
    prover: Prover
    unirepAddress: string
    attesterId: string
    
    constructor(db: DB, provider: ethers.providers.JsonRpcProvider, prover: Prover, unirepAddress: ethers.Contract, attesterId: ethers.Contract) {
        this.db = db
        this.provider = provider
        this.prover = prover
        this.unirepAddress = unirepAddress.address
        this.attesterId = attesterId.address
    }

    async createUserState(user: User, wallet?: any | undefined) {
        let signature = user.signMsg
        if (wallet != undefined) {
            signature = await wallet.signMessage(user.hashUserId)
        }
        const identity = new Identity(signature)
        return new UserState({
            db: this.db,
            provider: this.provider,
            prover: this.prover,
            unirepAddress: this.unirepAddress,
            attesterId: BigInt(this.attesterId),
            id: identity,
        })
    }
}