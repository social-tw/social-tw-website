import { ethers } from 'ethers'
import { NoWalletError, WalletSignError } from '../errors'

export class EthereumHelper {
    static async signUserIdWithWallet(hashUserId: string) {
        if (!window.ethereum) {
            throw new NoWalletError()
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            })
            const account = accounts[0]

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [
                    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(hashUserId)),
                    account,
                ],
            })

            return signature
        } catch {
            throw new WalletSignError()
        }
    }
}
