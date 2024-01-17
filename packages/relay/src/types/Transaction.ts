import { ethers } from 'ethers'

export interface TransactionResult {
    txHash: string
    logs: (ethers.utils.LogDescription | null)[]
}
