import ABI from '@unirep-app/contracts/abi/UnirepApp.json'
import { DB } from 'anondb/node'
import { Contract, ethers } from 'ethers'
import { APP_ADDRESS, MAX_FEE_PER_GAS } from '../../config'
import {
    NoDBConnectedError,
    TransactionResult,
    UninitializedError,
    UserAlreadySignedUpError,
} from '../../types'

export class TransactionManager {
    appContract?: Contract
    wallet?: ethers.Wallet
    _db?: DB

    /**
     * Configure the transaction manager with key, provider, and database.
     *
     * @param key - The key for the wallet.
     * @param provider - The provider for the ethers wallet.
     * @param db - The database instance.
     */
    configure(key: string, provider: any, db: DB) {
        this.wallet = new ethers.Wallet(key, provider)
        this._db = db
        this.appContract = new ethers.Contract(APP_ADDRESS, ABI, provider)
    }

    /**
     * Start the transaction manager.
     */
    async start() {
        if (!this.wallet || !this._db) throw UninitializedError
        const latestNonce = await this.wallet.getTransactionCount()
        await this._db.upsert('AccountNonce', {
            where: {
                address: this.wallet.address,
            },
            create: {
                address: this.wallet.address,
                nonce: latestNonce,
            },
            update: {},
        })
        this.startDaemon()
    }

    /**
     * Start the daemon to continuously check for transactions.
     */
    async startDaemon() {
        if (!this._db) throw NoDBConnectedError
        for (;;) {
            const nextTx = await this._db.findOne('AccountTransaction', {
                where: {},
                orderBy: {
                    nonce: 'asc',
                },
            })
            if (!nextTx) {
                await new Promise((r) => setTimeout(r, 5000))
                continue
            }
            const sent = await this.tryBroadcastTransaction(nextTx.signedData)
            if (sent) {
                await this._db.delete('AccountTransaction', {
                    where: {
                        signedData: nextTx.signedData,
                    },
                })
            } else {
                const randWait = Math.random() * 2000
                await new Promise((r) => setTimeout(r, 1000 + randWait))
            }
        }
    }

    /**
     * Try broadcasting a signed transaction.
     *
     * @param signedData - The signed transaction data.
     * @returns True if the transaction was sent, false otherwise.
     */
    async tryBroadcastTransaction(signedData: string) {
        if (!this.wallet) throw UninitializedError
        const hash = ethers.utils.keccak256(signedData)
        try {
            console.log(`Sending tx ${hash}`)
            await this.wallet.provider.sendTransaction(signedData)
            return true
        } catch (err: any) {
            const tx = await this.wallet.provider.getTransaction(hash)
            if (tx) {
                // if the transaction is reverted the nonce is still used, so we return true
                return true
            }
            if (
                err
                    .toString()
                    .indexOf(
                        'Your app has exceeded its compute units per second capacity',
                    ) !== -1
            ) {
                await new Promise((r) => setTimeout(r, 1000))
                return this.tryBroadcastTransaction(signedData)
            } else {
                console.log(err)
                return false
            }
        }
    }

    /**
     * Get the nonce for a given address.
     *
     * @param address - The address to get the nonce for.
     * @returns The nonce for the given address.
     */
    async getNonce(address: string) {
        const latest = await this._db?.findOne('AccountNonce', {
            where: {
                address,
            },
        })
        const updated = await this._db?.update('AccountNonce', {
            where: {
                address,
                nonce: latest.nonce,
            },
            update: {
                nonce: latest.nonce + 1,
            },
        })
        if (updated === 0) {
            await new Promise((r) => setTimeout(r, Math.random() * 500))
            return this.getNonce(address)
        }
        return latest.nonce
    }

    /**
     * Execute a transaction and return parsed logs.
     *
     * @param contract - The contract instance.
     * @param to - The address to send the transaction to.
     * @param data - The transaction data.
     * @returns An array of parsed logs.
     */
    async executeTransaction(
        contract: Contract,
        to: string,
        data: string | any = {},
    ): Promise<TransactionResult> {
        const hash = await this.queueTransaction(to, data)
        const receipt = await this.wallet?.provider.waitForTransaction(hash)

        let parsedLogs: (ethers.utils.LogDescription | null)[] = []
        if (receipt && receipt.logs) {
            parsedLogs = receipt.logs
                .map((log: ethers.providers.Log) => {
                    try {
                        return contract.interface.parseLog(log)
                    } catch (e) {
                        return null // It's not an event from our contract, ignore.
                    }
                })
                .filter(
                    (log: ethers.utils.LogDescription | null) => log !== null,
                )
        }
        return { txHash: hash, logs: parsedLogs }
    }

    /**
     * Queue a transaction for execution.
     *
     * @param to - The address to send the transaction to.
     * @param data - The transaction data.
     * @returns The keccak256 hash of the signed transaction.
     */
    async queueTransaction(
        to: string,
        data: string | any = {},
    ): Promise<string> {
        const args = {} as any
        if (typeof data === 'string') {
            // assume it's input data
            args.data = data
        } else {
            Object.assign(args, data)
        }
        if (!this.wallet) throw UninitializedError
        if (!args.gasLimit) {
            // don't estimate, use this for unpredictable gas limit tx's
            // transactions may revert with this
            let gasLimit: ethers.BigNumber = ethers.BigNumber.from(0)
            try {
                gasLimit = await this.wallet.provider.estimateGas({
                    to,
                    from: this.wallet.address,
                    ...args,
                })
            } catch (error) {
                const err = error as any
                if (
                    err.message &&
                    err.message.includes('UserAlreadySignedUp')
                ) {
                    throw UserAlreadySignedUpError
                } else {
                    console.error(err)
                }
            }

            Object.assign(args, {
                gasLimit: gasLimit?.add(50000),
            })
        }
        const nonce = await this.getNonce(this.wallet.address)
        const gasPrice = await this.wallet.provider.getGasPrice()
        const { chainId } = await this.wallet.provider.getNetwork()
        const signedData = await this.wallet.signTransaction({
            nonce,
            to,
            chainId,
            // gasPrice, // EIP-1559 use maxFeePerGas instead of gasPrice
            maxFeePerGas: MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: MAX_FEE_PER_GAS,
            type: 2, // 2 for EIP-1559
            ...args,
        })
        await this._db?.create('AccountTransaction', {
            address: this.wallet.address,
            signedData,
            nonce,
        })
        return ethers.utils.keccak256(signedData)
    }

    /**
     * The general method for calling a contract function
     *
     * @param functionSignature
     * @param args
     * @returns txnHash
     */
    async callContract(
        functionSignature: string, // 'leaveComment' for example
        args: any[],
    ): Promise<string> {
        if (!this.appContract) throw UninitializedError
        const appContract = this.appContract

        const calldata = appContract.interface.encodeFunctionData(
            functionSignature,
            [...args],
        )
        const hash = await this.queueTransaction(appContract.address, calldata)

        return hash
    }
}

export default new TransactionManager()
